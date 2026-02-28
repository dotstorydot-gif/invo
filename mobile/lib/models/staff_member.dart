class StaffMember {
  final String id;
  final String name;
  final String? role;
  final double baseSalary;
  final String? avatarUrl;
  final String? email;
  final double? penalties;
  final int? vacationDays;

  StaffMember({
    required this.id,
    required this.name,
    this.role,
    required this.baseSalary,
    this.avatarUrl,
    this.email,
    this.penalties,
    this.vacationDays,
  });

  factory StaffMember.fromMap(Map<String, dynamic> map) {
    return StaffMember(
      id: map['id'].toString(),
      name: map['name'],
      role: map['role'],
      baseSalary: (map['base_salary'] ?? 0).toDouble(),
      avatarUrl: map['avatar_url'],
      email: map['email'],
      penalties: (map['penalties'] ?? 0).toDouble(),
      vacationDays: map['vacation_days'] as int?,
    );
  }
}
