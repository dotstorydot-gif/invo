class Supplier {
  final String id;
  final String companyName;
  final String? contactName;
  final String? phone;
  final String? email;
  final String? category;
  final double rating;

  Supplier({
    required this.id,
    required this.companyName,
    this.contactName,
    this.phone,
    this.email,
    this.category,
    required this.rating,
  });

  factory Supplier.fromMap(Map<String, dynamic> map) {
    return Supplier(
      id: map['id'].toString(),
      companyName: map['company_name'] ?? map['name'] ?? 'Unknown Supplier',
      contactName: map['contact_person'] ?? map['contact_name'],
      phone: map['phone'],
      email: map['email'],
      category: map['category'],
      rating: (map['rating'] ?? 0).toDouble(),
    );
  }
}
