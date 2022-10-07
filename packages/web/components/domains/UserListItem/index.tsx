import type { CSSProperties } from "react"
import styled from "@emotion/styled"
import { ProfileAvatar } from "~/components/domains"
import { Button, Spacer, Text } from "~/components/uis"
import {
  useFollowCancelMutation,
  useFollowCreateMutation,
} from "~/features/notifications"
import type { APIUser } from "~/types/domains/objects"

interface Props {
  className?: string
  style?: CSSProperties
  isFollowed?: boolean
  user: Pick<APIUser, "id" | "nickname" | "profileImage">
}
// 아바타 + 이름 + 버튼

const UserListItem = ({ className, style, isFollowed, user }: Props) => {
  const { id, nickname, profileImage } = user

  const followCancelMutation = useFollowCancelMutation()
  const followCreateMutation = useFollowCreateMutation()

  return (
    <ListItem className={className} style={style}>
      <Spacer type="horizontal" gap={10} align="center">
        <ProfileAvatar
          profileImage={profileImage}
          userId={id}
          nickname={nickname}
        />
        <Text size="base" strong>
          {nickname}
        </Text>
      </Spacer>
      <div>
        {isFollowed === undefined ? (
          <></>
        ) : isFollowed ? (
          <Button
            onClick={() => followCancelMutation.mutate({ receiverId: user.id })}
            secondary
          >
            팔로잉
          </Button>
        ) : (
          <Button
            onClick={() => followCreateMutation.mutate({ receiverId: user.id })}
          >
            팔로우
          </Button>
        )}
      </div>
    </ListItem>
  )
}

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
`

export default UserListItem
