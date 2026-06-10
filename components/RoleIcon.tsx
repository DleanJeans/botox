import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getRoleIconUrl, getTeamEmoji } from '../data/roleIcons';
import { TEAM_COLORS } from '../data/roles';

interface RoleIconProps {
  roleId: string;
  team: string;
  size?: number;
  showBorder?: boolean;
  circular?: boolean;
}

export default function RoleIcon({
  roleId,
  team,
  size = 24,
  showBorder = true,
  circular = false,
}: RoleIconProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const iconUrl = getRoleIconUrl(roleId, team);

  const borderColor = showBorder ? TEAM_COLORS[team] || '#555' : 'transparent';
  const teamColor = TEAM_COLORS[team] || '#555';

  if (failed || !iconUrl) {
    return (
      <View
        style={[
          styles.fallback,
          {
            width: size,
            height: size,
            borderRadius: 4,
            borderColor,
            backgroundColor: `${teamColor}22`,
          },
        ]}
      >
        <Text
          style={[
            styles.fallbackText,
            {
              fontSize: size * 0.45,
            },
          ]}
        >
          {getTeamEmoji(team)}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: circular ? size / 2 : 4,
          borderColor,
        },
      ]}
    >
      {/* Skeleton placeholder while loading */}
      {!loaded && (
        <View
          style={[
            styles.skeleton,
            {
              width: size,
              height: size,
              backgroundColor: `${teamColor}18`,
            },
          ]}
        >
          <Text
            style={[
              styles.skeletonText,
              {
                fontSize: size * 0.35,
              },
            ]}
          >
            {getTeamEmoji(team)}
          </Text>
        </View>
      )}
      <Image
        source={{
          uri: iconUrl,
        }}
        style={{
          width: size,
          height: size,
          opacity: loaded ? 1 : 0,
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'relative',
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  skeletonText: {
    textAlign: 'center',
    opacity: 0.5,
  },
  fallback: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    textAlign: 'center',
  },
});
