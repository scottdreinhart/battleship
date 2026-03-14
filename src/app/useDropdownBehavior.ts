import { useEffect, useRef } from 'react'

interface DropdownConfig {
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement | null>
  panelRef: React.RefObject<HTMLElement | null>
  onOutsideClick?: () => void
}

const useDropdownBehavior = ({
  open,
  onClose,
  triggerRef,
  panelRef,
  onOutsideClick,
}: DropdownConfig): void => {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) {
      return
    }

    const handleOutside = (e: Event) => {
      const target = e.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        onOutsideClick?.()
        onCloseRef.current()
      }
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, triggerRef, panelRef, onOutsideClick])
}

export default useDropdownBehavior
