import React from 'react'
import {ActionList, ActionMenu, Box} from '@primer/react'
import * as getNav from '../util/get-nav'
import usePage from '../hooks/use-page'
import {LinkNoUnderline} from './link'
import useLocationChange from '../hooks/use-location-change'
import styled from 'styled-components'

const StyledOverlay = styled(ActionMenu.Overlay)`
  background-color: var(--bgColor-default, #ffffff) !important;
  border-color: var(--borderColor-default, #d0d7de);
  border-width: 1px;
  border-style: solid;
  box-shadow: var(--shadow-resting-medium, 0 3px 6px rgba(140, 149, 159, 0.15));
`

const VariantItem = ({title, shortName, url, active}) => {
  return (
    <ActionList.Item state={{scrollUpdate: false}} id={shortName} active={active}>
      <LinkNoUnderline to={url}>{title}</LinkNoUnderline>
    </ActionList.Item>
  )
}

const useVariantFocus = () => {
  const locationChange = useLocationChange()
  const anchorRef = React.useRef(null)

  React.useEffect(() => {
    if (locationChange.change && getNav.didVariantChange(locationChange.previous, locationChange.current)) {
      anchorRef.current.focus()
    }
  }, [locationChange])

  return anchorRef
}

const VariantMenu = ({title, latest, current, prerelease, legacy}) => {
  const [open, setOpen] = React.useState(false)
  const anchorRef = useVariantFocus()
  const labelId = 'label-versions-list-item'
  const locationChange = useLocationChange()

  React.useEffect(() => {
    if (locationChange.change && getNav.didVariantChange(locationChange.previous, locationChange.current)) {
      setOpen(false)
    }
  }, [locationChange.change, locationChange.current, locationChange.previous])

  return (
    <>
      <Box as="p" sx={{m: 0}} id={labelId}>
        Select CLI Version:
      </Box>
      <ActionMenu anchorRef={anchorRef} open={open} onOpenChange={setOpen}>
        <ActionMenu.Button aria-describedby={labelId} sx={{width: ['100%', null, 'auto']}}>
          {title}
        </ActionMenu.Button>
        <StyledOverlay width="auto" onEscape={() => setOpen(false)}>
          <ActionList aria-labelledby={labelId}>
            <ActionList.Group>
              <ActionList.GroupHeading>Current</ActionList.GroupHeading>
              <VariantItem {...latest} />
              {current && <VariantItem {...current} />}
              {prerelease && <VariantItem {...prerelease} />}
            </ActionList.Group>
            <ActionList.Group>
              <ActionList.GroupHeading>Legacy</ActionList.GroupHeading>
              {legacy.map(item => (
                <VariantItem key={item.title} {...item} />
              ))}
            </ActionList.Group>
          </ActionList>
        </StyledOverlay>
      </ActionMenu>
    </>
  )
}

const useVariants = () => {
  const {pathname: path} = usePage().location

  return React.useMemo(() => {
    const variantPages = getNav.getVariantsForPath(path)

    if (!variantPages.length) {
      return null
    }

    const result = {latest: null, current: null, prerelease: null, legacy: []}

    for (const {variant, page} of variantPages) {
      const item = {...variant, url: page.url, active: page.url === path}
      let typeDesc = ''
      switch (variant.type) {
        case 'latest':
          result.latest = item
          typeDesc = ' (Latest)'
          break
        case 'current':
          result.current = item
          typeDesc = ' (Current)'
          break
        case 'prerelease':
          result.prerelease = item
          typeDesc = ' (Prerelease)'
          break
        default:
          result.legacy.push(item)
          typeDesc = ' (Legacy)'
      }
      if (item.active) {
        result.title = `${item.title}${typeDesc}`
      }
    }

    result.legacy.sort((a, b) => parseInt(b.shortName.slice(1)) - parseInt(a.shortName.slice(1)))

    return result
  }, [path])
}

const VariantSelect = () => {
  const variants = useVariants()
  return variants ? (
    <Box sx={{mt: 2, mb: 3}}>
      <VariantMenu {...variants} />
    </Box>
  ) : null
}

export default VariantSelect
