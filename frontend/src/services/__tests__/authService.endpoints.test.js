import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the underlying apiService so we can assert the URLs authService targets
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

import authService from '../authService'
import apiService from '../api'

describe('authService endpoints (FEAT-003)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('does not expose calls to removed /auth/* helper endpoints', () => {
    // These methods pointed at nonexistent backend routes and must be gone
    expect(authService.getUserTeams).toBeUndefined()
    expect(authService.getUserProjects).toBeUndefined()
    expect(authService.getTeamPermissions).toBeUndefined()
    expect(authService.getProjectPermissions).toBeUndefined()
    expect(authService.validateTeamInvite).toBeUndefined()
    expect(authService.joinTeamByInvite).toBeUndefined()
    expect(authService.leaveTeam).toBeUndefined()
    expect(authService.leaveProject).toBeUndefined()
  })

  it('register/login/logout/me target the real auth routes', async () => {
    apiService.post.mockResolvedValue({ success: true, data: { user: { _id: '1' } } })
    apiService.get.mockResolvedValue({ success: true, data: { user: { _id: '1' } } })

    await authService.register({ fullname: 'A', username: 'a', email: 'a@b.c', password: 'secret1' })
    expect(apiService.post).toHaveBeenCalledWith('/auth/register', expect.any(Object))

    await authService.login({ email: 'a@b.c', password: 'secret1' })
    expect(apiService.post).toHaveBeenCalledWith('/auth/login', expect.any(Object))

    await authService.logout()
    expect(apiService.post).toHaveBeenCalledWith('/auth/logout')

    await authService.getCurrentUser()
    expect(apiService.get).toHaveBeenCalledWith('/auth/me', expect.any(Object))
  })

  it('updateUserProfile is repointed to PUT /users/profile (not /auth/profile)', async () => {
    apiService.put.mockResolvedValue({ success: true, data: { user: { _id: '1', fullname: 'New' } } })

    await authService.updateUserProfile({ fullname: 'New' })

    expect(apiService.put).toHaveBeenCalledWith('/users/profile', { fullname: 'New' })
    // Ensure no call targeted the removed /auth/profile route
    const calledUrls = apiService.put.mock.calls.map((c) => c[0])
    expect(calledUrls).not.toContain('/auth/profile')
  })
})
