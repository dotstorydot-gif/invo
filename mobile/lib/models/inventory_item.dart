class InventoryItem {
  final String id;
  final String name;
  final String? code;
  final double stock;
  final double costPrice;
  final String? description;
  final DateTime createdAt;

  InventoryItem({
    required this.id,
    required this.name,
    this.code,
    required this.stock,
    required this.costPrice,
    this.description,
    required this.createdAt,
  });

  factory InventoryItem.fromMap(Map<String, dynamic> map) {
    return InventoryItem(
      id: map['id'],
      name: map['name'],
      code: map['code'],
      stock: (map['stock'] ?? 0).toDouble(),
      costPrice: (map['cost_price'] ?? 0).toDouble(),
      description: map['description'],
      createdAt: DateTime.parse(map['created_at']),
    );
  }
}
