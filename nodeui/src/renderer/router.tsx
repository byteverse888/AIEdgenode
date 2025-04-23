import { createHashHistory, createRouter, useNavigate } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import platform from './platform'

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => {
    const navigate = useNavigate()
    navigate({ to: '/', replace: true }) // 重定向到首页
    return null
  },
  history: platform.type === 'web' ? undefined : createHashHistory(),
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
