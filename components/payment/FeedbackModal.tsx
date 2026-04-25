import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star } from 'lucide-react-native';

interface FeedbackModalProps {
  visible: boolean;
  rewardName: string;
  redemptionId: string;
  feedbackUrl: string;  // POST URL
  onDone: () => void;   // called after submit or skip
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  rewardName,
  redemptionId,
  feedbackUrl,
  onDone,
}) => {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const LABELS = ['', 'Terrible', 'Not great', 'Okay', 'Good', 'Excellent!'];

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await fetch(feedbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
    } catch (_) {
      // non-blocking — don't block the user if feedback fails
    } finally {
      setSubmitting(false);
      onDone();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>How was it?</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {rewardName}
        </Text>

        {/* Star Rating */}
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)} activeOpacity={0.7}>
              <Star
                size={40}
                color={s <= rating ? '#f59e0b' : '#e2e8f0'}
                fill={s <= rating ? '#f59e0b' : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {rating > 0 && (
          <Text style={styles.ratingLabel}>{LABELS[rating]}</Text>
        )}

        {/* Comment */}
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment (optional)"
          placeholderTextColor="#94a3b8"
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={200}
        />

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting
            ? <ActivityIndicator size="small" color="#ffffff" />
            : <Text style={styles.submitText}>Submit Feedback</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={onDone} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 28,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 28,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f59e0b',
    marginBottom: 20,
  },
  commentInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
    marginTop: 8,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  skipBtn: {
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
});

export default FeedbackModal;
