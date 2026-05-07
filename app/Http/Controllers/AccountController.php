<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Accounts');
    }

    public function apiIndex(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->integer('per_page', 10), 100));
        $sort = $request->string('sort')->toString();
        $order = $request->string('order')->lower()->toString() === 'desc' ? 'desc' : 'asc';
        $search = $request->string('search')->toString();

        $sortableColumns = ['name', 'type', 'initial_balance', 'created_at'];

        $accounts = Account::query()
            ->withSum(['transactions as total_credits' => fn ($query) => $query->where('type', 'credit')], 'amount')
            ->withSum(['transactions as total_debits' => fn ($query) => $query->where('type', 'debit')], 'amount')
            ->withSum(['transactions as total_transfer_out' => fn ($query) => $query->where('type', 'transfer_out')], 'amount')
            ->withSum(['transactions as total_transfer_in' => fn ($query) => $query->where('type', 'transfer_in')], 'amount')
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->when(in_array($sort, $sortableColumns, true), fn ($query) => $query->orderBy($sort, $order), fn ($query) => $query->orderBy('name'))
            ->paginate($perPage)
            ->through(fn (Account $account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'balance' => (int) $account->initial_balance
                    + (int) ($account->total_credits ?? 0)
                    - (int) ($account->total_debits ?? 0)
                    - (int) ($account->total_transfer_out ?? 0)
                    + (int) ($account->total_transfer_in ?? 0),
            ]);

        return response()->json([
            'data' => $accounts->items(),
            'meta' => [
                'current_page' => $accounts->currentPage(),
                'last_page' => $accounts->lastPage(),
                'per_page' => $accounts->perPage(),
                'total' => $accounts->total(),
                'from' => $accounts->firstItem(),
                'to' => $accounts->lastItem(),
            ],
        ]);
    }

    public function store(StoreAccountRequest $request): RedirectResponse
    {
        Account::create($request->validated());

        return to_route('accounts.index')->with('success', 'Conta criada com sucesso.');
    }

    public function update(UpdateAccountRequest $request, Account $account): RedirectResponse
    {
        $account->update($request->validated());

        return to_route('accounts.index')->with('success', 'Conta atualizada com sucesso.');
    }

    public function destroy(Account $account): RedirectResponse
    {
        if ($account->hasTransactions()) {
            throw ValidationException::withMessages([
                'account' => 'Conta possui movimentações. Remova as transações primeiro.',
            ]);
        }

        $account->delete();

        return to_route('accounts.index')->with('success', 'Conta excluída com sucesso.');
    }
}
