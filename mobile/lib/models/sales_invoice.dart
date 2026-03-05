class SalesInvoice {
  final String id;
  final String customerId;
  final double amount;
  final String status;
  final DateTime createdAt;
  final String organizationId;

  SalesInvoice({
    required this.id,
    required this.customerId,
    required this.amount,
    required this.status,
    required this.createdAt,
    required this.organizationId,
  });

  factory SalesInvoice.fromJson(Map<String, dynamic> json) {
    return SalesInvoice(
      id: json['id'] as String,
      customerId: json['customer_id'] as String,
      amount: (json['amount'] ?? 0.0).toDouble(),
      status: json['status'] as String? ?? 'Pending',
      createdAt: DateTime.parse(json['created_at'] as String),
      organizationId: json['organization_id'] as String,
    );
  }
}
