import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NavBar = ({ activeTab, setActiveTab, tabs }) => {
  const hasPrimary = tabs.some(t => t.primary);

  return (
    <View style={[styles.container, !hasPrimary && styles.containernoPrimary]}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isPrimary = tab.primary;
        const isActive = activeTab === tab.id;

        if (isPrimary) {
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={styles.primaryTab}
              activeOpacity={0.9}
            >
              <View style={styles.primaryIconContainer}>
                <IconComponent size={28} color="#ffffff" />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <IconComponent
              size={24}
              color={isActive ? '#4f46e5' : '#94a3b8'}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text style={[
              styles.label,
              isActive && styles.activeLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 40,
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    shadowRadius: 24,
    elevation: 8,
  },
  containernoPrimary: {
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryTab: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 32,
    marginTop: -32,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  primaryIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    // No extra styling needed, handled by icon color
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    color: '#94a3b8',
  },
  activeLabel: {
    color: '#4f46e5',
  },
});

export default NavBar;