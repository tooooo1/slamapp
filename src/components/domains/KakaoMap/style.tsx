import styled from "@emotion/styled"
import { IconButton } from "~/components/uis/molecules"

const PositionAction = styled.div<{ bottom?: number }>`
  position: absolute;
  top: ${({ bottom }) => (bottom ? `${bottom + 16}px` : "16px")};
  left: 12px;
  z-index: 10;
`

const MapIconButton = styled(IconButton)`
  padding: ${({ theme }) => theme.gaps.xs};
  border: none;
  border-radius: 12px;
`

const ZoomActions = styled.div<{ bottom?: number }>`
  display: inline-flex;
  flex-direction: column;
  position: absolute;
  right: 12px;
  bottom: ${({ bottom }) => (bottom ? `${bottom + 230}px` : "230px")};
  z-index: 10;

  button:first-of-type {
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray200};
  }
`

export { PositionAction, MapIconButton, ZoomActions }
