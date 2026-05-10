<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\TransferRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(): Response
    {
        $accounts = Account::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Account $account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'balance' => $account->balance(),
            ])
            ->values();

        $selectedAccountId = (int) request()->session()->get('transactions.selected_account_id', 0);

        if (! $accounts->contains('id', $selectedAccountId)) {
            $selectedAccountId = null;
            request()->session()->forget('transactions.selected_account_id');
        }

        return Inertia::render('Transactions/Index', [
            'accounts' => $accounts,
            'selectedAccountId' => $selectedAccountId,
        ]);
    }

    public function updateSelectedAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'account_id' => [
                'nullable',
                'integer',
                Rule::exists((new Account())->getTable(), 'id'),
            ],
        ]);

        if (empty($validated['account_id'])) {
            $request->session()->forget('transactions.selected_account_id');

            return response()->json(status: 204);
        }

        Account::query()->findOrFail($validated['account_id']);
        $request->session()->put('transactions.selected_account_id', $validated['account_id']);

        return response()->json(status: 204);
    }

    public function apiIndex(Account $account, Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->integer('per_page', 10), 100));

        $transactions = $account->transactions()
            ->with('category:id,name')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->through(fn (Transaction $transaction) => [
                'id' => $transaction->id,
                'type' => $transaction->type,
                'amount' => $transaction->amount,
                'description' => $transaction->description,
                'date' => $transaction->date?->format('Y-m-d'),
                'transfer_id' => $transaction->transfer_id,
                'category_id' => $transaction->category_id,
                'category_name' => $transaction->category?->name,
            ]);

        return response()->json([
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'from' => $transactions->firstItem(),
                'to' => $transactions->lastItem(),
            ],
        ]);
    }

    public function store(StoreTransactionRequest $request, Account $account): RedirectResponse
    {
        $validated = $request->validated();

        $transaction = Transaction::create([
            'account_id' => $account->id,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'description' => $validated['description'],
            'date' => $validated['date'] ?? now()->toDateString(),
            'category_id' => $validated['category_id'] ?? null,
        ]);

        $redirectTo = $validated['redirect_to'] ?? route('accounts.index');

        $redirect = redirect()->to($redirectTo)->with('success', 'Movimentação registrada com sucesso.');

        if ($transaction->type === 'debit' && $account->fresh()->balance() < 0) {
            $redirect->with('warning', 'O saldo desta conta ficou negativo após o lançamento.');
        }

        return $redirect;
    }

    public function update(UpdateTransactionRequest $request, Account $account, Transaction $transaction): RedirectResponse
    {
        if ($transaction->account_id !== $account->id || $transaction->type !== 'debit') {
            abort(404);
        }

        $transaction->update($request->validated());

        return to_route('transactions.index')->with('success', 'Gasto atualizado com sucesso.');
    }

    public function destroy(Account $account, Transaction $transaction): RedirectResponse
    {
        if ($transaction->account_id !== $account->id || $transaction->type !== 'debit') {
            abort(404);
        }

        $transaction->delete();

        return to_route('transactions.index')->with('success', 'Gasto removido com sucesso.');
    }

    public function transfer(TransferRequest $request, Account $account): RedirectResponse
    {
        $validated = $request->validated();
        $transferId = (string) Str::uuid();
        $date = $validated['date'] ?? now()->toDateString();
        $description = $validated['description'] ?? 'Transferência entre contas';

        DB::transaction(function () use ($account, $validated, $transferId, $date, $description) {
            $destinationAccount = Account::query()
                ->lockForUpdate()
                ->findOrFail($validated['destination_account_id']);

            Transaction::create([
                'account_id' => $account->id,
                'type' => 'transfer_out',
                'amount' => $validated['amount'],
                'description' => $description,
                'date' => $date,
                'transfer_id' => $transferId,
            ]);

            Transaction::create([
                'account_id' => $destinationAccount->id,
                'type' => 'transfer_in',
                'amount' => $validated['amount'],
                'description' => $description,
                'date' => $date,
                'transfer_id' => $transferId,
            ]);
        });

        return to_route('accounts.index')->with('success', 'Transferência realizada com sucesso.');
    }
}
