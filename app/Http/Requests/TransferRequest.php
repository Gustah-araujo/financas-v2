<?php

namespace App\Http\Requests;

use App\Models\Account;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class TransferRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'destination_account_id' => ['required', 'integer'],
            'amount' => ['required', 'integer', 'min:1'],
            'date' => ['nullable', 'date'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            $sourceAccount = $this->route('account');
            $destinationAccountId = (int) $this->input('destination_account_id');

            if (! $sourceAccount instanceof Account) {
                return;
            }

            if ($destinationAccountId === $sourceAccount->id) {
                $validator->errors()->add('destination_account_id', 'A conta destino não pode ser igual à origem.');
                return;
            }

            $destinationAccount = Account::query()->find($destinationAccountId);

            if (! $destinationAccount) {
                $validator->errors()->add('destination_account_id', 'A conta de destino não está mais disponível.');
            }
        }];
    }
}
