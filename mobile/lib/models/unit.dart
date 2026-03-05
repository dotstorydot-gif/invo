class Unit {
  final String id;
  final String name;
  final String status;
  final String? type;
  final double? price;
  final String organizationId;

  Unit({
    required this.id,
    required this.name,
    required this.status,
    this.type,
    this.price,
    required this.organizationId,
  });

  factory Unit.fromJson(Map<String, dynamic> json) {
    return Unit(
      id: json['id'] as String,
      name: json['name'] as String,
      status: json['status'] as String? ?? 'Available',
      type: json['type'] as String?,
      price: (json['price'] ?? 0.0).toDouble(),
      organizationId: json['organization_id'] as String,
    );
  }
}
