import 'package:flutter_localization/flutter_localization.dart';

class AppTranslation {
  static const String dashboard = 'dashboard';
  static const String inventory = 'inventory';
  static const String staff = 'staff';
  static const String suppliers = 'suppliers';
  static const String financials = 'financials';
  static const String welcome = 'welcome';
  static const String login = 'login';
  static const String email = 'email';
  static const String password = 'password';
  static const String logout = 'logout';

  static const Map<String, dynamic> EN = {
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    staff: 'Staff',
    suppliers: 'Suppliers',
    financials: 'Financials',
    welcome: 'Welcome back',
    login: 'SIGN IN',
    email: 'Email Address',
    password: 'Password',
    logout: 'LOGOUT',
  };

  static const Map<String, dynamic> AR = {
    dashboard: 'لوحة التحكم',
    inventory: 'المخزون',
    staff: 'الموظفين',
    suppliers: 'الموردين',
    financials: 'المالية',
    welcome: 'مرحباً بك مجدداً',
    login: 'تسجيل الدخول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    logout: 'تسجيل الخروج',
  };
}
