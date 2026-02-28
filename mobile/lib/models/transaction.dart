class Transaction {
  final String id;
  final String amount;
  final String type; // 'in' or 'out'
  final String category;
  final String? description;
  final DateTime createdAt;

  Transaction({
    required this.id,
    required this.amount,
    required this.type,
    required this.category,
    this.description,
    required this.createdAt,
  });

  factory Transaction.fromMap(Map<String, dynamic> map) {
    return Transaction(
      id: map['id'].toString(),
      amount: map['amount'].toString(),
      type: map['type'] ?? 'out',
      category: map['category'] ?? 'General',
      description: map['description'],
      createdAt: DateTime.parse(map['created_at']),
    );
  }
}
