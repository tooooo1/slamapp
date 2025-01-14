import { useEffect, useRef, useState } from 'react'
import Router, { useRouter } from 'next/router'
import { css, useTheme } from '@emotion/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useScrollContainer } from '~/layouts'
import { useSetNavigation } from '../../navigations'

const PageLoader = () => {
  const theme = useTheme()
  const router = useRouter()

  const visiteds = useRef<{ [pathname: string]: true }>({
    [router.pathname]: true,
  })
  const [isProgressBar, setIsProgressBar] = useState(false)

  const scrollContainer = useScrollContainer()
  const setNavigation = useSetNavigation()

  useEffect(() => {
    const progressBarOn = (url: string) => {
      const nextPathname = url.split('?')[0]
      if (!visiteds.current[nextPathname]) {
        setIsProgressBar(true)
        setNavigation.all((prev) => ({
          ...prev,
        }))
        visiteds.current[nextPathname] = true
      }
    }

    const progressBarOff = () => {
      setIsProgressBar(false)
      setNavigation.all((prev) => ({
        ...prev,
      }))
    }

    Router.events.on('routeChangeStart', progressBarOn)
    Router.events.on('routeChangeComplete', progressBarOff)
    Router.events.on('routeChangeError', progressBarOff)

    return () => {
      Router.events.off('routeChangeStart', progressBarOn)
      Router.events.off('routeChangeComplete', progressBarOff)
      Router.events.off('routeChangeError', progressBarOff)
    }
  }, [router.pathname])

  return (
    <AnimatePresence mode="wait">
      {isProgressBar && (
        <motion.div
          initial={{ backgroundColor: '#e8e8e800' }}
          animate={{ backgroundColor: '#e8e8e8' }}
          exit={{ backgroundColor: '#e8e8e800' }}
          css={css`
            position: fixed;
            width: ${scrollContainer.width}px;
            height: 100%;
          `}
        >
          <motion.div
            animate={{
              width: ['0%', '80%', '81%', '82%', '83%', '84%', '85%', '86%', '87%', '88%', '89%', '90%'],
              transition: { duration: 10 },
            }}
            exit={{ width: `100%`, height: 0 }}
            css={css`
              position: absolute;
              top: 0;
              height: 8px;
              background: linear-gradient(
                to right,
                ${theme.colors.gray0100} 8%,
                ${theme.colors.gray0500} 18%,
                ${theme.colors.gray0100} 33%
              );
              background-size: 800px 104px;
              border-radius: 0 16px 16px 0;
              animation-name: placeHolderShimmer;
              animation-duration: 2s;
              animation-timing-function: linear;
              animation-iteration-count: infinite;
              animation-fill-mode: forwards;
              @keyframes placeHolderShimmer {
                0% {
                  background-position: -800px 0;
                }
                100% {
                  background-position: 800px 0;
                }
              }
            `}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PageLoader
