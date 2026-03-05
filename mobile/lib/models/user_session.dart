class UserSession {
  final String userId;
  final String orgId;
  final String role;
  final String username;
  final String fullName;
  final String orgName;
  final String? profilePicture;
  final String? subscriptionPlan;
  final String moduleType;
  final bool isEmployee;

  UserSession({
    required this.userId,
    required this.orgId,
    required this.role,
    required this.username,
    required this.fullName,
    required this.orgName,
    this.profilePicture,
    this.subscriptionPlan,
    required this.moduleType,
    required this.isEmployee,
  });

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      userId: json['userId'] as String,
      orgId: json['orgId'] as String,
      role: json['role'] as String,
      username: json['username'] as String,
      fullName: json['fullName'] as String,
      orgName: json['orgName'] as String,
      profilePicture: json['profilePicture'] as String?,
      subscriptionPlan: json['subscriptionPlan'] as String?,
      moduleType: json['moduleType'] as String? ?? 'Real Estate',
      isEmployee: json['isEmployee'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'orgId': orgId,
      'role': role,
      'username': username,
      'fullName': fullName,
      'orgName': orgName,
      'profilePicture': profilePicture,
      'subscriptionPlan': subscriptionPlan,
      'moduleType': moduleType,
      'isEmployee': isEmployee,
    };
  }
}
