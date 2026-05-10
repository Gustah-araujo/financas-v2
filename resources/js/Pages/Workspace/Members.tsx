import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Breadcrumbs from '@/Components/layout/Breadcrumbs';
import PageTitle from '@/Components/layout/PageTitle';
import Button from '@/Components/ui/Button';
import ConfirmDialog from '@/Components/ui/Modal/ConfirmDialog';
import InviteModal from '@/Components/workspace/InviteModal';
import Alert from '@/Components/ui/Alert';
import { toast, confirm } from '@/lib/toast';
import type { Member, Invitation } from '@/types/workspace';

interface Props {
  members: Member[];
  pendingInvitations: Invitation[];
  canManageMembers: boolean;
}

const roleBadgeClasses: Record<string, string> = {
  owner: 'bg-primary-100 text-primary-800 border-primary-300',
  editor: 'bg-gray-100 text-gray-700 border-gray-300',
};

const roleLabels: Record<string, string> = {
  owner: 'Proprietário',
  editor: 'Editor',
};

const roleOptions = [
  { value: 'owner', label: 'Proprietário' },
  { value: 'editor', label: 'Editor' },
];

const breadcrumbItems = [
  { label: 'Dashboard', href: route('dashboard') },
  { label: 'Membros' },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function Members({ members, pendingInvitations, canManageMembers }: Props) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [removeMemberId, setRemoveMemberId] = useState<number | null>(null);
  const [removeMemberName, setRemoveMemberName] = useState('');
  const [roleKeys, setRoleKeys] = useState<Record<number, number>>({});

  async function handleRoleChange(memberId: number, newRole: string) {
    const result = await confirm({
      title: 'Alterar papel',
      text: `Deseja alterar o papel deste membro para "${roleLabels[newRole]}"?`,
      confirmText: 'Alterar',
      cancelText: 'Cancelar',
      icon: 'question',
    });

    if (!result.isConfirmed) {
      setRoleKeys((prev) => ({ ...prev, [memberId]: (prev[memberId] || 0) + 1 }));
      return;
    }

    router.patch(
      route('workspace.members.update-role', { user: memberId }),
      { role: newRole },
      {
        preserveScroll: true,
        onSuccess: () => toast.success('Papel atualizado com sucesso.'),
        onError: (errors) => {
          toast.error(Object.values(errors).join(', '));
          setRoleKeys((prev) => ({ ...prev, [memberId]: (prev[memberId] || 0) + 1 }));
        },
      },
    );
  }

  function handleRemoveClick(memberId: number, memberName: string) {
    setRemoveMemberId(memberId);
    setRemoveMemberName(memberName);
  }

  function handleRemove() {
    if (removeMemberId === null) return;

    router.delete(route('workspace.members.destroy', { user: removeMemberId }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Membro removido com sucesso.');
        setRemoveMemberId(null);
        setRemoveMemberName('');
      },
      onError: (errors) => {
        toast.error(Object.values(errors).join(', '));
        setRemoveMemberId(null);
        setRemoveMemberName('');
      },
    });
  }

  async function handleCancelInvitation(invitationId: number) {
    const result = await confirm({
      title: 'Cancelar convite',
      text: 'Tem certeza que deseja cancelar este convite?',
      confirmText: 'Cancelar convite',
      cancelText: 'Voltar',
      icon: 'warning',
    });

    if (!result.isConfirmed) return;

    router.delete(route('workspace.invitations.destroy', { invitation: invitationId }), {
      preserveScroll: true,
      onSuccess: () => toast.success('Convite cancelado.'),
      onError: (errors) => toast.error(Object.values(errors).join(', ')),
    });
  }

  return (
    <AuthenticatedLayout>
      <Breadcrumbs items={breadcrumbItems} />
      <PageTitle
        title="Membros"
        description="Gerencie os membros e convites ativos do workspace."
        actions={
          canManageMembers ? (
            <Button onClick={() => setShowInviteModal(true)}>Convidar</Button>
          ) : undefined
        }
      />

      {members.length === 0 ? (
        <Alert variant="info">
          {canManageMembers
            ? 'Nenhum membro. Convide alguém para colaborar.'
            : 'Nenhum membro neste workspace.'}
        </Alert>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Papel
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrou em
                </th>
                {canManageMembers && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {member.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    {member.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {canManageMembers && member.role !== 'owner' ? (
                      <select
                        key={`role-${member.id}-${roleKeys[member.id] || 0}`}
                        defaultValue={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1 px-2"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          roleBadgeClasses[member.role]
                        }`}
                      >
                        {roleLabels[member.role]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(member.joined_at)}
                  </td>
                  {canManageMembers && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      {member.role !== 'owner' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveClick(member.id, member.name)}
                        >
                          Remover
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingInvitations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Convites Pendentes</h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enviado em
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expira em
                  </th>
                  {canManageMembers && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingInvitations.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {invitation.email || 'Link público'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(invitation.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(invitation.expires_at)}
                    </td>
                    {canManageMembers && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          Cancelar
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InviteModal open={showInviteModal} onClose={() => setShowInviteModal(false)} />

      <ConfirmDialog
        open={removeMemberId !== null}
        onClose={() => {
          setRemoveMemberId(null);
          setRemoveMemberName('');
        }}
        onConfirm={handleRemove}
        title="Remover Membro"
        message={`Tem certeza que deseja remover ${removeMemberName} do workspace?`}
        variant="danger"
        confirmText="Remover"
        cancelText="Cancelar"
      />
    </AuthenticatedLayout>
  );
}
