export const useChatScroll = (containerRef: Ref<HTMLElement | null>) => {

    const scrollToBottom = (behavior: 'auto' | 'smooth' = 'auto') => {
        nextTick(() => {
            if (containerRef.value) {
                containerRef.value.scrollTo({
                    top: containerRef.value.scrollHeight,
                    behavior
                })
            }
        })
    }

    const highlightMessage = (id: string) => {
        nextTick(() => {
            setTimeout(() => {
                const el = document.getElementById(`msg-${id}`)
                if (el) {
                    el.scrollIntoView({behavior: 'smooth', block: 'center'})
                    el.classList.add('highlight-anim')
                    setTimeout(() => el.classList.remove('highlight-anim'), 3000)
                }
            }, 400)
        })
    }

    return {
        scrollToBottom,
        highlightMessage
    }
}