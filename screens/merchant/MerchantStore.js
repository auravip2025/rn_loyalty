import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  History,
  ChevronRight,
  Plus,
} from 'lucide-react-native';
import Card from '../../components/old_app/common/Card';
import Button from '../../components/old_app/common/Button';
import ProgramConfigEditor from '../../components/old_app/merchant/ProgramConfigEditor';

const MerchantStore = ({ programs, onUpdateProgram }) => {
  const [selectedProgram, setSelectedProgram] = useState(null);

  const handleSave = (updatedProgram) => {
    onUpdateProgram(updatedProgram);
    setSelectedProgram(null);
  };

  if (selectedProgram) {
    return (
      <ProgramConfigEditor
        program={selectedProgram}
        onSave={handleSave}
        onBack={() => setSelectedProgram(null)}
      />
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Programs</Text>
        <TouchableOpacity style={styles.historyButton}>
          <History size={18} color="#059669" />
        </TouchableOpacity>
      </View>

      <View style={styles.programsList}>
        {programs.map((program) => (
          <Card
            key={program.id}
            onPress={() => setSelectedProgram(program)}
            style={styles.programCard}>
            <View style={styles.programRow}>
              <View style={styles.programLeft}>
                <View 
                  style={[
                    styles.programIcon,
                    { backgroundColor: `#${program.color === 'amber' ? 'f59e0b' : 
                      program.color === 'rose' ? 'f43f5e' :
                      program.color === 'emerald' ? '10b981' :
                      program.color === 'indigo' ? '6366f1' :
                      program.color === 'purple' ? 'a855f7' :
                      program.color === 'blue' ? '3b82f6' : '6366f1'}20` 
                    }
                  ]}>
                  <program.icon 
                    size={22} 
                    color={`#${program.color === 'amber' ? 'f59e0b' : 
                      program.color === 'rose' ? 'f43f5e' :
                      program.color === 'emerald' ? '10b981' :
                      program.color === 'indigo' ? '6366f1' :
                      program.color === 'purple' ? 'a855f7' :
                      program.color === 'blue' ? '3b82f6' : '6366f1'}` 
                    } 
                  />
                </View>
                <View>
                  <Text style={styles.programName}>{program.name}</Text>
                  <Text style={styles.programDesc}>{program.desc}</Text>
                </View>
              </View>
              <View style={styles.programRight}>
                <View 
                  style={[
                    styles.statusBadge,
                    program.active ? styles.statusActive : styles.statusInactive
                  ]}>
                  <Text style={[
                    styles.statusText,
                    program.active ? styles.statusTextActive : styles.statusTextInactive
                  ]}>
                    {program.active ? 'Active' : 'Paused'}
                  </Text>
                </View>
                <ChevronRight size={16} color="#cbd5e1" />
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Button 
        variant="outline" 
        style={styles.addButton}>
        <Plus size={18} color="#94a3b8" />
        <Text style={styles.addButtonText}>Configure New Program</Text>
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  historyButton: {
    padding: 8,
  },
  programsList: {
    gap: 12,
    marginBottom: 24,
  },
  programCard: {
    paddingVertical: 16,
  },
  programRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  programLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  programIcon: {
    padding: 12,
    borderRadius: 16,
  },
  programName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 20,
  },
  programDesc: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  programRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#ecfdf5',
  },
  statusInactive: {
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextInactive: {
    color: '#64748b',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    paddingVertical: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
});

export default MerchantStore;
