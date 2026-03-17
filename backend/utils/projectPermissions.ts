const PERMISSIONS: Record<string, string[]> = {
    owner: ['create', 'read', 'update', 'delete', 'manage_members'],
    admin: ['create', 'read', 'update', 'delete'],
    editor: ['create', 'read', 'update'],
    viewer: ['read']
}

export default PERMISSIONS