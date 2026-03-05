class StaffMember {
  final String id;
  final String name;
  final String? role;
  final double salary;
  final String? avatarUrl;
  final String organizationId;

  StaffMember({
    required this.id,
    required this.name,
    this.role,
    required this.salary,
    this.avatarUrl,
    required this.organizationId,
  });

  factory StaffMember.fromJson(Map<String, dynamic> json) {
    return StaffMember(
      id: json['id'].toString(),
      name: (json['full_name'] ?? json['name'] ?? 'Unknown').toString(),
      role: json['role']?.toString(),
      salary: (json['base_salary'] ?? json['salary'] ?? 0.0).toDouble(),
      avatarUrl: json['avatar_url']?.toString(),
      organizationId: (json['organization_id'] ?? '').toString(),
    );
  }
}
