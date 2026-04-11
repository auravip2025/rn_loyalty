import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertCircle } from 'lucide-react-native';
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
  Gift,
  Check,
} from 'lucide-react-native';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

// ─── Catalog Item Picker Modal ────────────────────────────────────────────────
const CatalogItemPicker = ({ visible, items, onSelect, onClose, onGoToCatalog }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={pickerStyles.overlay} activeOpacity={1} onPress={onClose}>
      <View style={pickerStyles.sheet}>
        <View style={pickerStyles.handle} />
        <Text style={pickerStyles.title}>Select Reward Item</Text>
        {items.length === 0 ? (
          <View style={pickerStyles.empty}>
            <View style={pickerStyles.emptyIconRing}>
              <Gift size={28} color="#6366f1" />
            </View>
            <Text style={pickerStyles.emptyText}>No Catalog Items Yet</Text>
            <Text style={pickerStyles.emptySubText}>
              You need to create reward items in the Catalog tab before you can link them to your programs.
            </Text>
            <TouchableOpacity
              style={pickerStyles.emptyBtn}
              onPress={() => { onClose(); onGoToCatalog?.(); }}
            >
              <Text style={pickerStyles.emptyBtnText}>Go to Catalog →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items.filter(i => i.isEnabled !== false)}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={pickerStyles.row} onPress={() => { onSelect(item); onClose(); }}>
                <View style={pickerStyles.rowInfo}>
                  <Text style={pickerStyles.rowName}>{item.name}</Text>
                  <Text style={pickerStyles.rowMeta}>
                    {item.pointsPrice ? `${item.pointsPrice} pts` : 'Spin/Scratch prize'}
                    {item.stock > 0 ? `  ·  ${item.stock} in stock` : ''}
                  </Text>
                </View>
                <Gift size={18} color="#6366f1" />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </TouchableOpacity>
  </Modal>
);

const pickerStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingHorizontal: 20, paddingBottom: 40, maxHeight: '70%',
  },
  handle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  empty: { alignItems: 'center', paddingVertical: 28, gap: 10, paddingHorizontal: 8 },
  emptyIconRing: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center',
  },
  emptyText: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  emptySubText: { fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 18 },
  emptyBtn: {
    marginTop: 4, backgroundColor: '#6366f1', paddingHorizontal: 24,
    paddingVertical: 11, borderRadius: 12,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '900', color: '#fff' },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  rowInfo: { flex: 1, marginRight: 12 },
  rowName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  rowMeta: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
});

// ─── Main Component ───────────────────────────────────────────────────────────
const ProgramConfigEditor = ({
  program,
  onSave,
  onBack,
  saving = false,
  saveError = null,
  catalogItems = [],
  merchantId,
  onGoToCatalog,
}) => {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    tierDiscounts: { Bronze: '5%', Silver: '10%', Gold: '15%', Platinum: '20%' },
    segments: program.segments || [
      { label: '50 Pts',  color: '#6366f1', type: 'points',   value: 50 },
      { label: 'No Luck', color: '#94a3b8', type: 'none',     value: 0 },
      { label: '10% Off', color: '#10b981', type: 'discount', value: 10 },
      { label: 'Free Tea', color: '#f59e0b', type: 'item',    value: 'Tea' },
      { label: '2x Pts',  color: '#ec4899', type: 'multiplier', value: 2 },
      { label: 'Try Again', color: '#94a3b8', type: 'none',   value: 0 },
    ],
    redeemableItemIds: [],
    ...program,
  });
  const [selectedTier, setSelectedTier] = useState('Bronze');

  // Catalog picker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // { type: 'segment', idx } | { type: 'redeemable' }

  const isWheel   = program.key === 'wheel'   || program.name?.includes('Wheel');
  const isScratch = program.key === 'scratch' || program.name?.includes('Scratch');
  const isTiered  = program.key === 'tiered'  || program.name?.includes('Tiered');
  const isPoints  = program.key === 'points'  || program.name?.includes('Points');
  const isStamps  = program.key === 'stamps'  || program.name?.includes('Stamps');
  const isGamePrize = isWheel || isScratch;

  // Find catalog item name by ID
  const catalogItemName = (id) => {
    if (!id) return null;
    const found = catalogItems.find(i => i.id === id);
    return found ? found.name : 'Unknown item';
  };

  // Open picker for a segment row
  const openSegmentPicker = (idx) => {
    setPickerTarget({ type: 'segment', idx });
    setPickerVisible(true);
  };

  // Open picker for redeemable items (loyalty points)
  const openRedeemablePicker = () => {
    setPickerTarget({ type: 'redeemable' });
    setPickerVisible(true);
  };

  const handlePickerSelect = (catalogItem) => {
    if (!pickerTarget) return;

    if (pickerTarget.type === 'segment') {
      const newSegs = [...formData.segments];
      newSegs[pickerTarget.idx] = {
        ...newSegs[pickerTarget.idx],
        label: catalogItem.name,
        value: catalogItem.name,
        catalogItemId: catalogItem.id,
      };
      setFormData({ ...formData, segments: newSegs });
    } else if (pickerTarget.type === 'redeemable') {
      const existing = formData.redeemableItemIds || [];
      if (!existing.includes(catalogItem.id)) {
        setFormData({ ...formData, redeemableItemIds: [...existing, catalogItem.id] });
      }
    }
    setPickerTarget(null);
  };

  const removeRedeemableItem = (id) => {
    setFormData({
      ...formData,
      redeemableItemIds: (formData.redeemableItemIds || []).filter(i => i !== id),
    });
  };

  // ── Gamification fields (Wheel / Scratch) ──────────────────────────────────
  const renderGameFields = () => (
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
          {isWheel ? 'Wheel Segments' : 'Scratch Outcomes'}
        </Text>
        <TouchableOpacity
          onPress={() => {
            const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#ef4444'];
            const newSegs = [...(formData.segments || []), {
              label: 'New Prize', color: colors[Math.floor(Math.random() * colors.length)],
              type: 'none', value: 0,
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
                  newSegs[idx] = { ...newSegs[idx], label: text };
                  setFormData({ ...formData, segments: newSegs });
                }}
              />
              {/* Value field: catalog picker for 'item' type, numeric input otherwise */}
              {seg.type === 'item' ? (
                <TouchableOpacity
                  style={styles.catalogPickerBtn}
                  onPress={() => openSegmentPicker(idx)}
                >
                  <Gift size={12} color="#6366f1" />
                  <Text style={styles.catalogPickerText} numberOfLines={1}>
                    {seg.catalogItemId 
                      ? catalogItemName(seg.catalogItemId) 
                      : (catalogItems.length === 0 ? 'Create in Catalog' : 'Link item')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TextInput
                  style={styles.segmentValue}
                  value={String(seg.value)}
                  placeholder="Val"
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const newSegs = [...formData.segments];
                    newSegs[idx] = { ...newSegs[idx], value: text };
                    setFormData({ ...formData, segments: newSegs });
                  }}
                />
              )}
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
                    // Clear catalogItemId if switching away from 'item'
                    newSegs[idx] = { ...newSegs[idx], type, ...(type !== 'item' ? { catalogItemId: undefined } : {}) };
                    setFormData({ ...formData, segments: newSegs });
                  }}
                  style={[styles.typeButton, seg.type === type && styles.typeButtonActive]}>
                  <Text style={[styles.typeText, seg.type === type && styles.typeTextActive]}>
                    {type === 'none' ? 'None' : type === 'points' ? 'Pts' : type === 'discount' ? '%' : 'Item'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // ── Tiered membership fields ───────────────────────────────────────────────
  const renderTieredFields = () => (
    <View style={styles.section}>
      <View style={styles.tierSelector}>
        <Text style={styles.tierLabel}>Select Tier Level</Text>
        <View style={styles.tierButtons}>
          {['Bronze', 'Silver', 'Gold', 'Platinum'].map(tier => (
            <TouchableOpacity
              key={tier}
              onPress={() => setSelectedTier(tier)}
              style={[styles.tierButton, selectedTier === tier && styles.tierButtonActive]}>
              <Crown size={16} color={selectedTier === tier ? '#4f46e5' : '#94a3b8'} />
              <Text style={[styles.tierButtonText, selectedTier === tier && styles.tierButtonTextActive]}>
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
        onChange={(e) => setFormData({
          ...formData,
          tierDiscounts: { ...(formData.tierDiscounts || {}), [selectedTier]: e },
        })}
      />
    </View>
  );

  // ── Points-specific fields ─────────────────────────────────────────────────
  const renderPointsFields = () => (
    <View style={styles.section}>
      <Input
        label="Earn Rate (Pts per $1)"
        icon={Star}
        placeholder="e.g. 10"
        value={formData.earnRate || '1'}
        onChange={(e) => setFormData({ ...formData, earnRate: e })}
      />

      {/* Redeemable catalog items */}
      <View style={styles.redeemHeader}>
        <Text style={styles.segmentLabel}>Redeemable Rewards</Text>
        <TouchableOpacity onPress={openRedeemablePicker} style={styles.addButton}>
          <PlusCircle size={14} color="#4f46e5" />
          <Text style={styles.addButtonText}>Link item</Text>
        </TouchableOpacity>
      </View>

      {(formData.redeemableItemIds || []).length === 0 ? (
        <TouchableOpacity 
          style={[styles.redeemEmpty, catalogItems.length === 0 && styles.redeemEmptyWarning]} 
          onPress={catalogItems.length === 0 ? onGoToCatalog : openRedeemablePicker}
        >
          <Gift size={16} color={catalogItems.length === 0 ? "#f59e0b" : "#94a3b8"} />
          <Text style={[styles.redeemEmptyText, catalogItems.length === 0 && styles.redeemEmptyTextWarning]}>
            {catalogItems.length === 0 
              ? "You haven't created any rewards yet. Go to Catalog to create your first item." 
              : "Tap to link catalog items customers can redeem points for"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.redeemList}>
          {(formData.redeemableItemIds || []).map(id => (
            <View key={id} style={styles.redeemRow}>
              <Check size={14} color="#10b981" />
              <Text style={styles.redeemName} numberOfLines={1}>{catalogItemName(id)}</Text>
              <TouchableOpacity onPress={() => removeRedeemableItem(id)} style={styles.deleteButton}>
                <Trash2 size={14} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // ── Stamps-specific fields ─────────────────────────────────────────────────
  const renderStampsFields = () => (
    <View style={styles.section}>
      <Input
        label="Stamps needed for Reward"
        icon={QrCode}
        placeholder="e.g. 10"
        value={formData.targetStamps || '10'}
        onChange={(e) => setFormData({ ...formData, targetStamps: e })}
      />

      {/* Redeemable catalog items (same pattern as points) */}
      <View style={styles.redeemHeader}>
        <Text style={styles.segmentLabel}>Reward Item</Text>
        <TouchableOpacity onPress={openRedeemablePicker} style={styles.addButton}>
          <PlusCircle size={14} color="#4f46e5" />
          <Text style={styles.addButtonText}>Link item</Text>
        </TouchableOpacity>
      </View>

      {(formData.redeemableItemIds || []).length === 0 ? (
        <TouchableOpacity 
          style={[styles.redeemEmpty, catalogItems.length === 0 && styles.redeemEmptyWarning]} 
          onPress={catalogItems.length === 0 ? onGoToCatalog : openRedeemablePicker}
        >
          <Gift size={16} color={catalogItems.length === 0 ? "#f59e0b" : "#94a3b8"} />
          <Text style={[styles.redeemEmptyText, catalogItems.length === 0 && styles.redeemEmptyTextWarning]}>
            {catalogItems.length === 0 
              ? "No catalog items found. Create your reward item in the Catalog tab first." 
              : "Link the catalog item customers get when the stamp card is full"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.redeemList}>
          {(formData.redeemableItemIds || []).map(id => (
            <View key={id} style={styles.redeemRow}>
              <Check size={14} color="#10b981" />
              <Text style={styles.redeemName} numberOfLines={1}>{catalogItemName(id)}</Text>
              <TouchableOpacity onPress={() => removeRedeemableItem(id)} style={styles.deleteButton}>
                <Trash2 size={14} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderSpecificFields = () => {
    if (isGamePrize)  return renderGameFields();
    if (isTiered)     return renderTieredFields();
    if (isPoints)     return renderPointsFields();
    if (isStamps)     return renderStampsFields();
    // Cashback / Member Discount fallback
    return (
      <Input
        label="Discount / Cashback Value"
        icon={Tag}
        placeholder="e.g. 10% or $5"
        value={formData.discountVal || '10%'}
        onChange={(e) => setFormData({ ...formData, discountVal: e })}
      />
    );
  };

  return (
    <View style={[styles.safeWrapper, { paddingTop: insets.top }]}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
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
          <TouchableOpacity onPress={() => setFormData({ ...formData, active: !formData.active })}>
            {formData.active
              ? <ToggleRight size={40} color="#10b981" />
              : <ToggleLeft size={40} color="#94a3b8" />
            }
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

      {saveError ? (
        <View style={styles.saveErrorRow}>
          <AlertCircle size={14} color="#ef4444" />
          <Text style={styles.saveErrorText}>{saveError}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button variant="outline" onPress={onBack} style={styles.cancelButton} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="merchant"
          onPress={() => onSave(formData)}
          style={styles.saveButton}
          disabled={saving}
          loading={saving}>
          {saving
            ? <ActivityIndicator size="small" color="#ffffff" />
            : <Save size={18} color="#ffffff" />
          }
          <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </Button>
      </View>

      {/* Catalog item picker modal */}
      <CatalogItemPicker
        visible={pickerVisible}
        items={catalogItems}
        onSelect={handlePickerSelect}
        onClose={() => { setPickerVisible(false); setPickerTarget(null); }}
        onGoToCatalog={onGoToCatalog}
      />
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    marginHorizontal: -12,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 16, marginTop: 8, paddingHorizontal: 12,
  },
  backButton: {
    padding: 8, borderRadius: 999, width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  card: { marginBottom: 24, padding: 12, marginHorizontal: 12 },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  programInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { padding: 12, borderRadius: 16 },
  programName: { fontSize: 18, fontWeight: '900', color: '#0f172a', lineHeight: 24 },
  programStatus: {
    fontSize: 12, fontWeight: 'bold', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 4,
  },
  form: { gap: 8 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  section: { gap: 8 },

  // Segment rows
  segmentHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 8, marginBottom: 12,
  },
  segmentLabel: {
    fontSize: 10, fontWeight: '900', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addButtonText: { fontSize: 12, fontWeight: 'bold', color: '#4f46e5' },
  segmentsList: { gap: 12 },
  segmentRow: {
    flexDirection: 'column', gap: 8, backgroundColor: '#f8fafc',
    padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9',
  },
  segmentTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  segmentColor: { width: 12, height: 36, borderRadius: 6 },
  segmentInput: {
    flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8, fontSize: 12, color: '#0f172a',
  },
  segmentValue: {
    width: 48, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 8, paddingVertical: 6, paddingHorizontal: 4,
    fontSize: 12, textAlign: 'center', color: '#0f172a',
  },
  segmentPicker: { flexDirection: 'row', gap: 4 },
  typeButton: {
    flex: 1, paddingVertical: 6, paddingHorizontal: 2,
    borderRadius: 6, backgroundColor: '#e2e8f0', alignItems: 'center',
  },
  typeButtonActive: { backgroundColor: '#4f46e5' },
  typeText: { fontSize: 9, fontWeight: 'bold', color: '#64748b' },
  typeTextActive: { color: '#ffffff' },
  deleteButton: { padding: 4 },

  // Catalog item picker button inside segment
  catalogPickerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe',
    borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8,
  },
  catalogPickerText: { flex: 1, fontSize: 11, fontWeight: '700', color: '#4f46e5' },

  // Redeemable items (points / stamps)
  redeemHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 8, marginBottom: 4,
  },
  redeemEmpty: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 10, padding: 12, borderStyle: 'dashed',
  },
  redeemEmptyWarning: {
    backgroundColor: '#fffbeb', borderColor: '#f59e0b',
  },
  redeemEmptyText: { flex: 1, fontSize: 11, color: '#94a3b8', fontStyle: 'italic' },
  redeemEmptyTextWarning: { color: '#92400e', fontWeight: '600' },
  redeemList: {
    backgroundColor: '#f8fafc', borderRadius: 10,
    borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden',
  },
  redeemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  redeemName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#0f172a' },

  // Tier selector
  tierSelector: { marginBottom: 16 },
  tierLabel: {
    fontSize: 10, fontWeight: '900', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  tierButtons: { flexDirection: 'row', gap: 8 },
  tierButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 12, paddingHorizontal: 8,
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', borderRadius: 12,
  },
  tierButtonActive: { backgroundColor: '#eef2ff', borderColor: '#4f46e5' },
  tierButtonText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  tierButtonTextActive: { color: '#4f46e5' },

  // Save error
  saveErrorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
    marginHorizontal: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#fecaca',
  },
  saveErrorText: { flex: 1, fontSize: 12, color: '#dc2626', fontWeight: '600' },

  // Actions
  actions: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 32 },
  cancelButton: { flex: 1 },
  saveButton: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
});

export default ProgramConfigEditor;
