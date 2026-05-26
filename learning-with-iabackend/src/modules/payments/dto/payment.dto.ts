export class CreatePaymentDto {
  userId: string;
  amount: number;
  paymentMethod?: string;
  description?: string;
}

export class UpdatePaymentDto {
  status?: string;
  paymentMethod?: string;
  transactionId?: string;
  description?: string;
}
