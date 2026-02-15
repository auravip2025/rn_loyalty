import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  ArrowLeft,
  Tag,
  FileText,
  Percent,
  Clock,
  PlusCircle,
  Trash2,
  Crown,
  Star,
  QrCode,
  Save,
  ToggleRight,
  ToggleLeft,
} from 'lucide-react-native';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const ProgramConfigEditor = ({ program, onSave, onBack }) => {
  const [formData, setFormData] = useState({
    tierDiscounts: {
      Bronze: '5%',
      Silver: '10%',
      Gold: '15%',
      Platinum: '20%'
    },
    segments: program.segments || [
      { label: '50 Pts', color: '#6366f1', type: 'points', value: 50 },
      { label: 'No Luck', color: '#94a3b8', type: 'none', value: 0 },
      { label: '10% Off', color: '#10b981', type: 'discount', value: 10 },
      { label: 'Free Tea', color: '#f59e0b', type: 'item', value: 'Tea' },
      { label: '2x Pts', color: '#ec4899', type: 'multiplier', value: 2 },
      { label: 'Try Again', color: '#94a3b8', type: 'none', value: 0 },
    ],
    ...program,
  });
  const [selectedTier, setSelectedTier] = useState('Bronze');

  const renderSpecificFields = () => {
    if (program.name.includes('Wheel') || program.name.includes('Scratch')) {
      return (
        <View style={styles.section}>
          <Input
            label="Win Probability (%)"
            icon={Percent}
            placeholder="e.g. 25"
            value={formData.probability || '25'}
            onChange={(e) => setFormData({ ...formData, probability: e })}
          />
          <Input
            label="Daily Play Limit"
            icon={Clock}
            placeholder="e.g. 1"
            value={formData.dailyLimit || '1'}
            onChange={(e) => setFormData({ ...formData, dailyLimit: e })}
          />

          <View style={styles.segmentHeader}>
            <Text style={styles.segmentLabel}>
              {program.name.includes('Wheel') ? 'Wheel Segments' : 'Scratch Outcomes'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#ef4444'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                const newSegs = [...(formData.segments || []), {
                  label: 'New Prize',
                  color: randomColor,
                  type: 'none',
                  value: 0
                }];
                setFormData({ ...formData, segments: newSegs });
              }}
              style={styles.addButton}>
              <PlusCircle size={14} color="#4f46e5" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.segmentsList}>
            {(formData.segments || []).map((seg, idx) => (
              <View key={idx} style={styles.segmentRow}>
                <View style={styles.segmentTopRow}>
                  <View style={[styles.segmentColor, { backgroundColor: seg.color }]} />
                  <TextInput
                    style={styles.segmentInput}
                    value={seg.label}
                    placeholder="Label"
                    onChangeText={(text) => {
                      const newSegs = [...formData.segments];
                      newSegs[idx].label = text;
                      setFormData({ ...formData, segments: newSegs });
                    }}
                  />
                  <TextInput
                    style={styles.segmentValue}
                    value={String(seg.value)}
                    placeholder="Val"
                    keyboardType="numeric"
                    onChangeText={(text) => {
                      const newSegs = [...formData.segments];
                      newSegs[idx].value = text;
                      setFormData({ ...formData, segments: newSegs });
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      const newSegs = formData.segments.filter((_, i) => i !== idx);
                      setFormData({ ...formData, segments: newSegs });
                    }}
                    style={styles.deleteButton}>
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.segmentPicker}>
                  {['none', 'points', 'discount', 'item'].map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => {
                        const newSegs = [...formData.segments];
                        newSegs[idx].type = type;
                        setFormData({ ...formData, segments: newSegs });
                      }}
                      style={[
                        styles.typeButton,
                        seg.type === type && styles.typeButtonActive
                      ]}>
                      <Text style={[
                        styles.typeText,
                        seg.type === type && styles.typeTextActive
                      ]}>
                        {type === 'none' ? 'None' :
                          type === 'points' ? 'Pts' :
                            type === 'discount' ? '%' : 'Item'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (program.name.includes('Tiered')) {
      return (
        <View style={styles.section}>
          <View style={styles.tierSelector}>
            <Text style={styles.tierLabel}>Select Tier Level</Text>
            <View style={styles.tierButtons}>
              {['Bronze', 'Silver', 'Gold', 'Platinum'].map(tier => (
                <TouchableOpacity
                  key={tier}
                  onPress={() => setSelectedTier(tier)}
                  style={[
                    styles.tierButton,
                    selectedTier === tier && styles.tierButtonActive
                  ]}>
                  <Crown
                    size={16}
                    color={selectedTier === tier ? '#4f46e5' : '#94a3b8'}
                  />
                  <Text style={[
                    styles.tierButtonText,
                    selectedTier === tier && styles.tierButtonTextActive
                  ]}>
                    {tier}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label={`${selectedTier} Discount Value`}
            icon={Percent}
            placeholder="e.g. 5%"
            value={formData.tierDiscounts?.[selectedTier] || ''}
            onChange={(e) => {
              const updatedDiscounts = {
                ...(formData.tierDiscounts || {}),
                [selectedTier]: e
              };
              setFormData({ ...formData, tierDiscounts: updatedDiscounts });
            }}
          />
        </View>
      );
    }

    if (program.name.includes('Points')) {
      return (
        <Input
          label="Earn Rate (Pts per $1)"
          icon={Star}
          placeholder="e.g. 10"
          value={formData.earnRate || '1'}
          onChange={(e) => setFormData({ ...formData, earnRate: e })}
        />
      );
    }

    if (program.name.includes('Stamps')) {
      return (
        <Input
          label="Stamps needed for Reward"
          icon={QrCode}
          placeholder="e.g. 10"
          value={formData.targetStamps || '10'}
          onChange={(e) => setFormData({ ...formData, targetStamps: e })}
        />
      );
    }

    return (
      <Input
        label="Discount Value"
        icon={Tag}
        placeholder="e.g. 10% or $5"
        value={formData.discountVal || '10%'}
        onChange={(e) => setFormData({ ...formData, discountVal: e })}
      />
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Configure Program</Text>
      </View>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.programInfo}>
            <View style={[styles.iconContainer, { backgroundColor: `#${program.color}-50` }]}>
              <program.icon size={28} color="#4f46e5" />
            </View>
            <View>
              <Text style={styles.programName}>{formData.name}</Text>
              <Text style={styles.programStatus}>
                {formData.active ? 'Active' : 'Paused'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setFormData({ ...formData, active: !formData.active })}>
            {formData.active ? (
              <ToggleRight size={40} color="#10b981" />
            ) : (
              <ToggleLeft size={40} color="#94a3b8" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input
            label="Display Name"
            icon={Tag}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e })}
          />
          <Input
            label="Description"
            icon={FileText}
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e })}
          />

          <View style={styles.divider} />

          {renderSpecificFields()}
        </View>
      </Card>

      <View style={styles.actions}>
        <Button variant="outline" onPress={onBack} style={styles.cancelButton}>
          Cancel
        </Button>
        <Button
          variant="merchant"
          onPress={() => onSave(formData)}
          style={styles.saveButton}>
          <Save size={18} color="#ffffff" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
    marginHorizontal: -12, // Pull tighter to screen edges (counteract parent padding)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    marginTop: 0,
    paddingHorizontal: 12, // Restore padding for header content
  },
  backButton: {
    padding: 8,
    borderRadius: 999,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  card: {
    marginBottom: 24,
    padding: 12,
    marginHorizontal: 12, // Keep card slightly away from absolute edge, or flush? Let's use 0 if we want max width, but 12 is safe.
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Reduced to 12
  },
  programInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 16,
  },
  programName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 24,
  },
  programStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  form: {
    gap: 8, // Reduced to 8
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  section: {
    gap: 8, // Reduced to 8
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  segmentLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  segmentsList: {
    gap: 12,
  },
  segmentRow: {
    flexDirection: 'column',
    gap: 8,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  segmentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmentColor: {
    width: 12,
    height: 36,
    borderRadius: 6,
  },
  segmentInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#0f172a',
  },
  segmentPicker: {
    flexDirection: 'row',
    gap: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#4f46e5',
  },
  typeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
  },
  typeTextActive: {
    color: '#ffffff',
  },
  segmentValue: {
    width: 48,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 12,
    textAlign: 'center',
    color: '#0f172a',
  },
  deleteButton: {
    padding: 4,
  },
  tierSelector: {
    marginBottom: 16,
  },
  tierLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tierButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  tierButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
  },
  tierButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#4f46e5',
  },
  tierButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  tierButtonTextActive: {
    color: '#4f46e5',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProgramConfigEditor;