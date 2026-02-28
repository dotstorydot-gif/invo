import 'package:flutter/material.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'app_translation.dart';

class LocaleProvider extends ChangeNotifier {
  final FlutterLocalization _localization = FlutterLocalization.instance;

  LocaleProvider() {
    _localization.init(
      mapLocales: [
        const MapLocale('en', AppTranslation.EN),
        const MapLocale('ar', AppTranslation.AR),
      ],
      initLanguageCode: 'en',
    );
  }

  String get currentLanguage => _localization.currentLocale?.languageCode ?? 'en';
  bool get isRTL => currentLanguage == 'ar';

  void setLanguage(String languageCode) {
    _localization.translate(languageCode);
    notifyListeners();
  }

  void toggleLanguage() {
    if (currentLanguage == 'en') {
      setLanguage('ar');
    } else {
      setLanguage('en');
    }
  }
}
