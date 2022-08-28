import Link from "next/link"
import { useRouter } from "next/router"
import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  ProfileFavoritesListItem,
  BasketballLoading,
} from "~/components/domains"
import { Text, Button, Spacer } from "~/components/uis/atoms"
import { Label, Chip, Avatar } from "~/components/uis/molecules"
import { DEFAULT_PROFILE_IMAGE_URL } from "~/constants"
import { useNavigationContext, useAuthContext } from "~/contexts/hooks"
import { withRouteGuard } from "~/hocs"
import useIsomorphicLayoutEffect from "~/hooks/useIsomorphicLayoutEffect"
import followAPI from "~/service/followApi"
import userApi from "~/service/userApi"
import type { APIUser } from "~/types/domains"
import {
  getTranslatedPositions,
  getTranslatedProficiency,
} from "~/utils/userInfo"

const User = withRouteGuard("private", () => {
  const { useMountPage, setNavigationTitle } = useNavigationContext()

  const { authProps } = useAuthContext()

  useMountPage("PAGE_USER")

  const router = useRouter()

  const { userId: pageUserId } = router.query

  const isMe = pageUserId === authProps.currentUser?.id

  const myProfileQuery = useQuery(
    ["myProfile", pageUserId],
    async () => {
      const { data } = await userApi.getMyProfile()

      return data
    },
    { enabled: router.isReady && isMe }
  )

  const userProfileQuery = useQuery(
    ["otherProfile", pageUserId],
    async () => {
      const { data } = await userApi.getUserProfile({ id: `${pageUserId}` })

      return data
    },
    { enabled: router.isReady && !isMe }
  )

  useIsomorphicLayoutEffect(() => {
    if (myProfileQuery.isSuccess) {
      setNavigationTitle(`${myProfileQuery.data.nickname}`)
    }

    if (userProfileQuery.isSuccess) {
      setNavigationTitle(`${userProfileQuery.data.nickname}`)
    }
  }, [setNavigationTitle, myProfileQuery.isSuccess, userProfileQuery.isSuccess])

  if (
    (isMe && myProfileQuery.isLoading) ||
    (!isMe && userProfileQuery.isLoading)
  ) {
    return <BasketballLoading />
  }

  if (myProfileQuery.isSuccess) {
    const {
      description,
      followerCount,
      followingCount,
      id,
      nickname,
      positions,
      proficiency,
      profileImage,
    } = myProfileQuery.data

    return (
      <div>
        <MainInfoContainer>
          <MainInfoArea>
            <Avatar
              src={profileImage ?? DEFAULT_PROFILE_IMAGE_URL}
              shape="circle"
            />
            <StatBar>
              <div>
                <Link href={`/user/${id}/following`}>
                  <a>
                    <dt>팔로잉</dt>
                    <dd>
                      <Text strong>{followingCount}</Text>
                    </dd>
                  </a>
                </Link>
              </div>
              <div>
                <Link href={`/user/${id}/follower`}>
                  <a>
                    <dt>팔로워</dt>
                    <dd>
                      <Text strong>{followerCount}</Text>
                    </dd>
                  </a>
                </Link>
              </div>
              <div>
                <dt>평가 점수</dt>
                <dd
                  onClick={() => alert("개발 예정")}
                  style={{ cursor: "pointer" }}
                >
                  6.3
                </dd>
              </div>
            </StatBar>
          </MainInfoArea>
          <Description>{description}</Description>
          <div>
            <Link href="/user/edit" passHref>
              <a>
                <Button fullWidth secondary>
                  프로필 편집
                </Button>
              </a>
            </Link>
          </div>
        </MainInfoContainer>

        <AdditionalInfoSpacer gap="base" type="vertical">
          <div>
            <Label>포지션</Label>
            <Spacer type="horizontal" gap="xs">
              {positions.length ? (
                getTranslatedPositions(positions).map(({ english, korean }) => (
                  <Chip key={english} secondary>
                    {korean}
                  </Chip>
                ))
              ) : (
                <Chip key="no_position" secondary>
                  선택한 포지션이 없습니다
                </Chip>
              )}
            </Spacer>
          </div>
          <div>
            <Label>숙련도</Label>
            <Chip secondary>
              {proficiency === null
                ? "미정"
                : getTranslatedProficiency(proficiency).korean}
            </Chip>
          </div>
          <div>
            <Label>{isMe ? "내가" : `${nickname}님이`} 즐겨찾는 농구장</Label>
            {authProps.favorites.length ? (
              authProps.favorites.map(({ id, court }) => (
                <ProfileFavoritesListItem key={id} courtId={court.id}>
                  {court.name}
                </ProfileFavoritesListItem>
              ))
            ) : (
              <Chip secondary>즐겨찾기한 농구장이 없습니다</Chip>
            )}
          </div>
        </AdditionalInfoSpacer>
      </div>
    )
  }

  if (userProfileQuery.isSuccess) {
    const {
      description,
      followerCount,
      followingCount,
      id,
      nickname,
      positions,
      proficiency,
      profileImage,
      favoriteCourts,
      isFollowing,
    } = userProfileQuery.data

    return (
      <div>
        <MainInfoContainer>
          <MainInfoArea>
            <Avatar
              src={profileImage ?? DEFAULT_PROFILE_IMAGE_URL}
              shape="circle"
            />
            <StatBar>
              <div>
                <Link href={`/user/${id}/following`}>
                  <a>
                    <dt>팔로잉</dt>
                    <dd>
                      <Text strong>{followingCount}</Text>
                    </dd>
                  </a>
                </Link>
              </div>
              <div>
                <Link href={`/user/${id}/follower`}>
                  <a>
                    <dt>팔로워</dt>
                    <dd>
                      <Text strong>{followerCount}</Text>
                    </dd>
                  </a>
                </Link>
              </div>
              <div>
                <dt>평가 점수</dt>
                <dd
                  onClick={() => alert("개발 예정")}
                  style={{ cursor: "pointer" }}
                >
                  6.3
                </dd>
              </div>
            </StatBar>
          </MainInfoArea>
          <Description>{description}</Description>
          {!isMe ? (
            <ButtonContainer>
              <Link href={`/chat/${id}`} passHref>
                <a style={{ width: "100%" }}>
                  <Button fullWidth secondary>
                    메시지
                  </Button>
                </a>
              </Link>
              <FollowButton
                isFollowing={isFollowing}
                receiverId={id}
                refetch={userProfileQuery.refetch}
              />
            </ButtonContainer>
          ) : (
            <div>
              <Link href="/user/edit" passHref>
                <a>
                  <Button fullWidth secondary>
                    프로필 편집
                  </Button>
                </a>
              </Link>
            </div>
          )}
        </MainInfoContainer>

        <AdditionalInfoSpacer gap="base" type="vertical">
          <div>
            <Label>포지션</Label>
            <Spacer type="horizontal" gap="xs">
              {positions.length ? (
                getTranslatedPositions(positions).map(({ english, korean }) => (
                  <Chip key={english} secondary>
                    {korean}
                  </Chip>
                ))
              ) : (
                <Chip key="no_position" secondary>
                  선택한 포지션이 없습니다
                </Chip>
              )}
            </Spacer>
          </div>
          <div>
            <Label>숙련도</Label>
            <Chip secondary>
              {proficiency === null
                ? "미정"
                : getTranslatedProficiency(proficiency).korean}
            </Chip>
          </div>
          <div>
            <Label>{isMe ? "내가" : `${nickname}님이`} 즐겨찾는 농구장</Label>
            {favoriteCourts.length ? (
              favoriteCourts.map(({ id, name }) => (
                <ProfileFavoritesListItem key={id} courtId={id}>
                  {name}
                </ProfileFavoritesListItem>
              ))
            ) : (
              <Chip secondary>등록한 농구장이 없습니다</Chip>
            )}
          </div>
        </AdditionalInfoSpacer>
      </div>
    )
  }

  return null
})

export default User

const FollowButton = ({
  isFollowing,
  receiverId,
  refetch,
}: {
  isFollowing: boolean
  receiverId: APIUser["id"]
  refetch: () => void
}) => {
  const followMutation = useMutation(
    () => followAPI.postFollow({ receiverId }),
    { onSuccess: () => refetch() }
  )
  const followCancelMutation = useMutation(
    () => followAPI.deleteFollow({ receiverId }),
    { onSuccess: () => refetch() }
  )

  return (
    <Button
      fullWidth
      loading={followMutation.isLoading || followCancelMutation.isLoading}
      disabled={followMutation.isLoading || followCancelMutation.isLoading}
      tertiary={isFollowing}
      onClick={() => {
        if (isFollowing) {
          followCancelMutation.mutate()
        } else {
          followMutation.mutate()
        }
      }}
    >
      {isFollowing ? `팔로잉` : `팔로우`}
    </Button>
  )
}

const MainInfoContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.gaps.lg} ${theme.gaps.base} ${theme.gaps.md};
    transition: background 200ms;
  `}
`

const AdditionalInfoSpacer = styled(Spacer)`
  ${({ theme }) => css`
    padding: ${theme.gaps.md} ${theme.gaps.base};
  `}
`

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const MainInfoArea = styled(FlexContainer)`
  ${({ theme }) => css`
    padding: 0 ${theme.gaps.xs};
  `}
`

const ButtonContainer = styled(FlexContainer)`
  ${({ theme }) => css`
    gap: 0 ${theme.gaps.xs};
  `}
`

const StatBar = styled.dl`
  ${({ theme }) => css`
    display: flex;
    text-align: center;
    margin: 0;
    flex-grow: 1;
    margin-left: ${theme.gaps.lg};
    justify-content: space-evenly;

    dd {
      box-sizing: border-box;
      margin: 0;
      font-weight: bold;
      padding: ${theme.gaps.xs} 0;
    }
  `}
`

const Description = styled.div`
  ${({ theme }) => css`
    margin: ${theme.gaps.md} 0;
    line-height: 1.4;
  `}
`
