import api from './axios'

export async function updateProfile({ name, email }) {
  const { data } = await api.patch('/user/profile', { name, email })
  return data.user
}

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.patch('/user/password', { currentPassword, newPassword })
  return data
}

export async function updatePreferences({ currency, theme }) {
  const { data } = await api.patch('/user/preferences', { currency, theme })
  return data.user
}

export async function deleteAccount({ password }) {
  // axios sends a request body on DELETE via the `data` option.
  const { data } = await api.delete('/user', { data: { password } })
  return data
}
