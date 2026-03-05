class Supplier {
  final String id;
  final String companyName;
  final String? contactName;
  final String? phone;
  final String? email;
  final String? category;
  final double rating;

  final String organizationId;

  Supplier({
    required this.id,
    required this.companyName,
    this.contactName,
    this.phone,
    this.email,
    this.category,
    required this.rating,
    required this.organizationId,
  });

  factory Supplier.fromJson(Map<String, dynamic> json) {
    return Supplier(
      id: json['id'].toString(),
      companyName: json['company_name'] ?? json['name'] ?? 'Unknown Supplier',
      contactName: json['contact_person'] ?? json['contact_name'],
      phone: json['phone'],
      email: json['email'],
      category: json['category'],
      rating: (json['rating'] ?? 0).toDouble(),
      organizationId: json['organization_id'] as String,
    );
  }
}
