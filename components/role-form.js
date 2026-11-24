'use client'

import { useActionState } from 'react'
import { updateRole } from '../app/users/actions'
import { ROLES } from '../backend/domain.mjs'

export default function RoleForm({ userId, role, version, name }) {
  const [state, action, pending] = useActionState(updateRole, null)
  return (
    <form action={action} className="role-form">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="version" value={version} />
      <label className="sr-only" htmlFor={`role-${userId}`}>
        Rol de {name}
      </label>
      <select
        key={`${userId}-${version}`}
        id={`role-${userId}`}
        name="role"
        defaultValue={role}
        disabled={pending}
      >
        {Object.entries(ROLES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button className="button secondary" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
      {state && (
        <span
          role={state.success ? 'status' : 'alert'}
          className={state.success ? 'muted' : 'error-text'}
        >
          {state.message}
        </span>
      )}
    </form>
  )
}
