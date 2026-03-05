class Customer {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String organizationId;

  Customer({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    required this.organizationId,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id'] as String,
      name: json['name'] as String? ?? json['full_name'] as String? ?? 'Unknown Customer',
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      organizationId: json['organization_id'] as String,
    );
  }
}
