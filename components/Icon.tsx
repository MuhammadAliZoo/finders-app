import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleProp, ViewStyle } from 'react-native';

export type IconName =
  | 'users'
  | 'box'
  | 'link'
  | 'alert-triangle'
  | 'bar-chart-2'
  | 'activity'
  | 'flag'
  | 'settings';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
  return <Feather name={name} size={size} color={color} style={style} />;
};

export default Icon;
