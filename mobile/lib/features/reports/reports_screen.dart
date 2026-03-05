import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../widgets/app_drawer.dart';
import '../../core/session_provider.dart';
import '../../services/dashboard_service.dart';
import '../../services/financial_service.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  final _dashboardService = DashboardService();
  final _financialService = FinancialService();
  bool _isLoading = true;
  DashboardMetrics? _dashMetrics;
  FinancialMetrics? _finMetrics;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final session = context.read<SessionProvider>().session;
    if (session == null) return;

    setState(() => _isLoading = true);
    try {
      final dash = await _dashboardService.fetchMetrics(session.orgId);
      final fin = await _financialService.getSummaryMetrics(session.orgId);
      setState(() {
        _dashMetrics = dash;
        _finMetrics = fin;
      });
    } catch (e) {
      debugPrint('Error loading reports data: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.compactCurrency(symbol: 'EGP ');
    
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('REPORTS & ANALYTICS'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFFFD700)))
          : RefreshIndicator(
              onRefresh: _loadData,
              color: const Color(0xFFFFD700),
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  _buildReportCategory(
                    title: 'Financial Health',
                    icon: LucideIcons.banknote,
                    color: Colors.greenAccent,
                    value: currencyFormat.format(_finMetrics?.totalExpenses ?? 0),
                    subtitle: 'Total recorded expenses',
                    items: ['Profit & Loss', 'Cash Flow Analysis'],
                  ),
                  const SizedBox(height: 16),
                  _buildReportCategory(
                    title: 'Customer Data',
                    icon: LucideIcons.trendingUp,
                    color: Colors.blueAccent,
                    value: '${_dashMetrics?.totalCustomers ?? 0}',
                    subtitle: 'Total registered customers',
                    items: ['Client Acquisition', 'Lifetime Value'],
                  ),
                  const SizedBox(height: 16),
                  _buildReportCategory(
                    title: 'Stock & Inventory',
                    icon: LucideIcons.package,
                    color: const Color(0xFFFFD700),
                    value: '${_dashMetrics?.activeUnits ?? 0}',
                    subtitle: 'Available units/items',
                    items: ['Inventory Valuation', 'Low Stock Reports'],
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildReportCategory({
    required String title,
    required IconData icon,
    required Color color,
    required String value,
    required String subtitle,
    required List<String> items,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(icon, color: color, size: 20),
                  const SizedBox(width: 12),
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ],
              ),
              Text(
                value,
                style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 18),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(color: Colors.white24, fontSize: 11)),
          const SizedBox(height: 20),
          ...items.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: InkWell(
              onTap: () {},
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(item, style: const TextStyle(color: Colors.white70, fontSize: 14)),
                  const Icon(LucideIcons.chevronRight, color: Colors.white12, size: 16),
                ],
              ),
            ),
          )).toList(),
        ],
      ),
    );
  }
}
