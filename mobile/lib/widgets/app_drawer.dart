import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons_flutter.dart';
import '../services/auth_service.dart';
import '../features/dashboard/dashboard_screen.dart';
import '../features/inventory/inventory_screen.dart';
import '../features/staff/staff_screen.dart';
import '../features/suppliers/suppliers_screen.dart';
import '../features/financials/financials_screen.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    // Get current route name
    final String? currentRoute = ModalRoute.of(context)?.settings.name;

    return Drawer(
      backgroundColor: const Color(0xFF0D0D0D),
      child: Column(
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.white12)),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                   const Text(
                    'INVO',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 4,
                      color: Color(0xFFFFD700),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Enterprise',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.4),
                      fontSize: 10,
                      letterSpacing: 1.5,
                    ),
                  ),
                ],
              ),
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
                  isSelected: currentRoute == '/' || currentRoute == null,
                  onTap: () => Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const DashboardScreen(), settings: const RouteSettings(name: '/')),
                  ),
                ),
                _buildDrawerItem(
                  context,
                  icon: LucideIcons.package,
                  label: 'Inventory',
                  isSelected: currentRoute == '/inventory',
                  onTap: () => Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const InventoryScreen(), settings: const RouteSettings(name: '/inventory')),
                  ),
                ),
                _buildDrawerItem(
                  context,
                  icon: LucideIcons.users,
                  label: 'Staff',
                  isSelected: currentRoute == '/staff',
                  onTap: () => Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const StaffScreen(), settings: const RouteSettings(name: '/staff')),
                  ),
                ),
                _buildDrawerItem(
                  context,
                  icon: LucideIcons.truck,
                  label: 'Suppliers',
                  isSelected: currentRoute == '/suppliers',
                  onTap: () => Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const SuppliersScreen(), settings: const RouteSettings(name: '/suppliers')),
                  ),
                ),
                _buildDrawerItem(
                  context,
                  icon: LucideIcons.banknote,
                  label: 'Financials',
                  isSelected: currentRoute == '/financials',
                  onTap: () => Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const FinancialsScreen(), settings: const RouteSettings(name: '/financials')),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16.0, horizontal: 16),
                  child: Divider(color: Colors.white10),
                ),
                _buildDrawerItem(
                  context,
                  icon: LucideIcons.settings,
                  label: 'Settings',
                  onTap: () {},
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: ElevatedButton.icon(
              onPressed: () => AuthService().signOut(),
              icon: const Icon(LucideIcons.logOut, size: 18),
              label: const Text('LOGOUT'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white10,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    bool isSelected = false,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        onTap: onTap,
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
