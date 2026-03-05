class InventoryItem {
  final String id;
  final String name;
  final int stock;
  final double costPrice;
  final String? description;
  final DateTime createdAt;
  final String? code;
  final String organizationId;

  InventoryItem({
    required this.id,
    required this.name,
    required this.stock,
    required this.costPrice,
    this.description,
    required this.createdAt,
    this.code,
    required this.organizationId,
  });

  factory InventoryItem.fromMap(Map<String, dynamic> map) {
    return InventoryItem(
      id: map['id'].toString(),
      name: map['name'],
      stock: (map['stock'] ?? 0).toInt(),
      costPrice: (map['cost_price'] ?? 0).toDouble(),
      description: map['description'],
      createdAt: DateTime.parse(map['created_at']),
      code: map['code'],
      organizationId: map['organization_id'],
    );
  }
}
