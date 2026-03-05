import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../core/session_provider.dart';
import '../features/dashboard/dashboard_screen.dart';
import '../features/inventory/inventory_screen.dart';
import '../features/staff/staff_screen.dart';
import '../features/suppliers/suppliers_screen.dart';
import '../features/financials/financials_screen.dart';
import '../features/units/units_screen.dart';
import '../features/sales/sales_screen.dart';
import '../features/reports/reports_screen.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionProvider>().session;
    if (session == null) return const SizedBox.shrink();

    // Get current route name
    final String? currentRoute = ModalRoute.of(context)?.settings.name;

    return Drawer(
      child: Container(
        color: const Color(0xFF0A0A0A),
        child: Column(
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Colors.white10)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  CircleAvatar(
                    backgroundColor: const Color(0xFFFFD700),
                    child: Text(
                      session.fullName.substring(0, 1).toUpperCase(),
                      style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    session.fullName,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    session.orgName,
                    style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                children: [
                  _buildDrawerItem(
                    context,
                    icon: LucideIcons.layoutDashboard,
                    label: 'Dashboard',
                    screen: const DashboardScreen(),
                    isSelected: currentRoute == '/' || currentRoute == null,
                  ),
                  _buildDrawerItem(
                    context,
                    icon: LucideIcons.package,
                    label: 'Inventory',
                    screen: const InventoryScreen(),
                    isSelected: currentRoute == '/inventory',
                  ),
                  _buildDrawerItem(
                    context,
                    icon: LucideIcons.users,
                    label: 'Staff / HR',
                    screen: const StaffScreen(),
                    isSelected: currentRoute == '/staff',
                  ),
                  _buildDrawerItem(
                    context,
                    icon: LucideIcons.van,
                    label: 'Suppliers',
                    screen: const SuppliersScreen(),
                    isSelected: currentRoute == '/suppliers',
                  ),
                  _buildDrawerItem(
                    context,
                    icon: LucideIcons.banknote,
                    label: 'Financials',
                    screen: const FinancialsScreen(),
                    isSelected: currentRoute == '/financials',
                  ),
                  _buildDrawerItem(
                    context,
                    icon: LucideIcons.house,
                    label: 'Units & Properties',
                    screen: const UnitsScreen(),
                    isSelected: currentRoute == '/units',
                  ),
                  _buildDrawerItem(
                    context,
                    icon: LucideIcons.briefcase,
                    label: 'Sales & Customers',
                    screen: const SalesScreen(),
                    isSelected: currentRoute == '/sales',
                  ),
                  _buildDrawerItem(
                    context,
                    icon: LucideIcons.fileText,
                    label: 'Invoices & Reports',
                    screen: const ReportsScreen(),
                    isSelected: currentRoute == '/reports',
                  ),
                  const Divider(color: Colors.white10, indent: 20, endIndent: 20),
                  _buildDrawerItem(
                    context,
                    icon: LucideIcons.settings,
                    label: 'Settings',
                    screen: const Scaffold(body: Center(child: Text('Settings Coming Soon'))),
                    isSelected: currentRoute == '/settings',
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: ListTile(
                onTap: () async {
                  await context.read<SessionProvider>().clearSession();
                },
                leading: Icon(LucideIcons.logOut, color: Colors.redAccent),
                title: const Text('Logout', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Widget screen,
    bool isSelected = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        onTap: () {
          Navigator.pop(context); // Close drawer
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => screen),
          );
        },
        selected: isSelected,
        selectedTileColor: const Color(0xFFFFD700).withOpacity(0.1),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        leading: Icon(
          icon,
          color: isSelected ? const Color(0xFFFFD700) : Colors.white60,
          size: 20,
        ),
        title: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.white60,
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
