<x-mail::message>
# Convite para Workspace

Você foi convidado(a) para participar do workspace **{{ $invitation->workspace->name }}**.

<x-mail::button :url="$inviteLink">
Aceitar Convite
</x-mail::button>

Obrigado,<br>
{{ config('app.name') }}
</x-mail::message>
