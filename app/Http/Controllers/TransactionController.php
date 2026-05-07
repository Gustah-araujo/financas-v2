<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\TransferRequest;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    public function apiIndex(Account $account, Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->integer('per_page', 10), 100));

        $transactions = $account->transactions()
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

        Transaction::create([
            'account_id' => $account->id,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'description' => $validated['description'],
            'date' => $validated['date'] ?? now()->toDateString(),
        ]);

        return to_route('accounts.index')->with('success', 'Movimentação registrada com sucesso.');
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
