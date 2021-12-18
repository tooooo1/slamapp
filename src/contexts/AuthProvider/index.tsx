import { useLocalToken } from "@hooks/domain";
import { useRouter } from "next/router";
import { useReducer, ReactNode, useEffect, useCallback } from "react";
import userAPI from "@service/userApi";
import reservationAPI from "@service/reservationApi";
import favoriteAPI from "@service/favoriteApi";
import Context from "./context";
import { initialData, reducer } from "./reducer";
import { authTypes } from "./actionTypes";
import AuthLoading from "./AuthLoading";
import { Notification } from "./types";

const LOG_OUT_LOGO_ANIMATION_DELAY_TIME_MS = 2000;
interface Props {
  children: ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  const [authProps, dispatch] = useReducer(reducer, initialData);
  const [token, _] = useLocalToken();

  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.clear();
    dispatch({ type: authTypes.CLEAR_CURRENT_USER });
    router.replace("/login");
    setTimeout(() => {
      dispatch({ type: authTypes.LOADING_OFF });
    }, LOG_OUT_LOGO_ANIMATION_DELAY_TIME_MS);
  }, [router]);

  const setCurrentUser = useCallback((data) => {
    dispatch({ type: authTypes.SET_CURRENT_USER, payload: data });
  }, []);

  const getCurrentUser = useCallback(async () => {
    dispatch({ type: authTypes.LOADING_ON });
    try {
      const data = await userAPI.getUserData();
      setCurrentUser(data);
    } catch (error) {
      console.error(error);
      logout();
    } finally {
      dispatch({ type: authTypes.LOADING_OFF });
    }
  }, [logout, setCurrentUser]);

  const getMyReservations = useCallback(async () => {
    try {
      const { reservations } = await reservationAPI.getMyReservations<{
        reservations: any[];
      }>();
      dispatch({
        type: authTypes.SET_MY_RESERVATIONS,
        payload: { reservations },
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const getMyFavorites = useCallback(async () => {
    try {
      const { favorites } = await favoriteAPI.getMyFavorites();

      dispatch({
        type: authTypes.GET_MY_FAVORITES,
        payload: { favorites },
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const createFavorite = useCallback(async (courtId: number) => {
    try {
      const favorite = await favoriteAPI.createMyFavorite(courtId);
      dispatch({
        type: authTypes.CREATE_FAVORITE,
        payload: { favorite },
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const deleteFavorite = useCallback(async (favoriteId: number) => {
    try {
      const { favoriteId: deletedFavoriteId } =
        await favoriteAPI.deleteMyFavorite<{ favoriteId: number }>(favoriteId);
      dispatch({
        type: authTypes.DELETE_FAVORITE,
        payload: { deletedFavoriteId },
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const pushNotification = (notification: Notification) => {
    console.log(notification);

    dispatch({
      type: authTypes.PUSH_NOTIFICATION,
      payload: { notification },
    });
  };

  const authProviderInit = async () => {
    // AuthProvider 마운트시 - 사용자정보(알림 포함) 받아오기
    try {
      await getCurrentUser().then(() => {
        getMyReservations();
        getMyFavorites();
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      authProviderInit();
    } else {
      dispatch({ type: authTypes.LOADING_OFF });
    }
  }, []);

  return (
    <Context.Provider
      value={{
        authProps,
        setCurrentUser,
        getCurrentUser,
        logout,
        createFavorite,
        deleteFavorite,
        pushNotification,
        getMyFavorites,
        getMyReservations,
      }}
    >
      <AuthLoading />
      {children}
    </Context.Provider>
  );
};

export default AuthProvider;
