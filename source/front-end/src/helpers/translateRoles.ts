export function translateRoles(role: string): string {
  const translations: { [key: string]: string } = {
    OPERATOR: 'Operador',
    TEAM_LEADER: 'Team Leader',
    SUPERVISOR: 'Supervisor',
    MANAGER: 'Gerente',
    GENERAL_MANAGER: 'Gerente Geral',
    ADMIN: 'Administrador',
    HUMAN_RESOURCES: 'Recursos Humanos',
    TECHNICAL_SUPPORT: 'Suporte Técnico',
    CHAMPION: 'Executor',
  }
  return translations[role] || role
}
