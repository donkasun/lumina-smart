import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ViewProps, View } from 'react-native';

interface LogoProps extends ViewProps {
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 100, style, ...props }) => {
  return (
    <View style={style} {...props}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
      >
        <Defs>
          <LinearGradient id="logo_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7CCFFF" />
            <Stop offset="100%" stopColor="#B84CFF" />
          </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" r="45" stroke="url(#logo_grad)" strokeWidth="2" strokeDasharray="10 5" />
        <Path
          d="M50 25 L65 50 L50 75 L35 50 Z"
          fill="url(#logo_grad)"
          stroke="white"
          strokeWidth="0.5"
        />
        <Circle cx="50" cy="50" r="5" fill="white" />
      </Svg>
    </View>
  );
};