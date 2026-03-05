import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../services/sales_service.dart';
import '../../models/customer.dart';
import '../../models/sales_invoice.dart';
import '../../widgets/app_drawer.dart';
import '../../core/session_provider.dart';

class SalesScreen extends StatefulWidget {
  const SalesScreen({super.key});

  @override
  State<SalesScreen> createState() => _SalesScreenState();
}

class _SalesScreenState extends State<SalesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _salesService = SalesService();
  bool _isLoading = true;
  
  List<Customer> _allCustomers = [];
  List<Customer> _filteredCustomers = [];
  
  List<SalesInvoice> _allInvoices = [];
  List<SalesInvoice> _filteredInvoices = [];
  
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      if (_tabController.index == 0) {
        _filteredCustomers = _allCustomers.where((c) => c.name.toLowerCase().contains(query) || (c.email?.toLowerCase().contains(query) ?? false)).toList();
      } else {
        _filteredInvoices = _allInvoices.where((i) => i.id.toLowerCase().contains(query) || i.status.toLowerCase().contains(query)).toList();
      }
    });
  }

  Future<void> _loadData() async {
    final session = context.read<SessionProvider>().session;
    if (session == null) return;

    setState(() => _isLoading = true);
    try {
      final customers = await _salesService.fetchCustomers(session.orgId);
      final invoices = await _salesService.fetchInvoices(session.orgId);
      setState(() {
        _allCustomers = customers;
        _filteredCustomers = customers;
        _allInvoices = invoices;
        _filteredInvoices = invoices;
      });
    } catch (e) {
      debugPrint('Error loading sales: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: const Text('SALES & CUSTOMERS'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFFFD700),
          labelColor: const Color(0xFFFFD700),
          unselectedLabelColor: Colors.white60,
          onTap: (_) => _onSearchChanged(), // Re-filter on tab switch
          tabs: const [
            Tab(text: 'Customers'),
            Tab(text: 'Invoices'),
          ],
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFF141414),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: TextField(
                controller: _searchController,
                style: const TextStyle(fontSize: 14),
                decoration: InputDecoration(
                  icon: const Icon(LucideIcons.search, size: 18, color: Colors.white24),
                  hintText: _tabController.index == 0 ? 'Search customers...' : 'Search invoices...',
                  hintStyle: const TextStyle(color: Colors.white24),
                  border: InputBorder.none,
                ),
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFFFD700)))
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildCustomerList(),
                      _buildInvoiceList(),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerList() {
    return RefreshIndicator(
      onRefresh: _loadData,
      color: const Color(0xFFFFD700),
      child: _filteredCustomers.isEmpty
          ? const Center(child: Text('No customers found', style: TextStyle(color: Colors.white24)))
          : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _filteredCustomers.length,
              itemBuilder: (context, index) {
                final customer = _filteredCustomers[index];
                return _buildCustomerCard(customer);
              },
            ),
    );
  }

  Widget _buildInvoiceList() {
    return RefreshIndicator(
      onRefresh: _loadData,
      color: const Color(0xFFFFD700),
      child: _filteredInvoices.isEmpty
          ? const Center(child: Text('No invoices found', style: TextStyle(color: Colors.white24)))
          : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _filteredInvoices.length,
              itemBuilder: (context, index) {
                final invoice = _filteredInvoices[index];
                return _buildInvoiceCard(invoice);
              },
            ),
    );
  }

  Widget _buildCustomerCard(Customer customer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xFFFFD700).withOpacity(0.1),
            child: Text(
              customer.name.substring(0, 1).toUpperCase(),
              style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  customer.name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  customer.email ?? customer.phone ?? 'No contact info',
                  style: const TextStyle(color: Colors.white38, fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const Icon(LucideIcons.chevronRight, size: 16, color: Colors.white12),
        ],
      ),
    );
  }

  Widget _buildInvoiceCard(SalesInvoice invoice) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.greenAccent.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(LucideIcons.fileText, color: Colors.greenAccent, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Invoice #${invoice.id.substring(0, 8)}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                Text(
                  DateFormat.yMMMd().format(invoice.createdAt),
                  style: const TextStyle(color: Colors.white38, fontSize: 11),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                'EGP ${NumberFormat.decimalPattern().format(invoice.amount)}',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Colors.white),
              ),
              const SizedBox(height: 4),
              Text(
                invoice.status.toUpperCase(),
                style: TextStyle(
                  color: invoice.status.toLowerCase() == 'completed' ? Colors.greenAccent : Colors.orangeAccent,
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
