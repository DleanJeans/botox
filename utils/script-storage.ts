import type { Game, Role, StoredScript } from '@/types/game';
import { mergeRoleCatalogMetadata } from '@/utils/role-utils';
import { SUSHI_BUFFET_SCRIPT_ID } from '@/utils/script-constants';

export function stripSushiBuffetScriptRoles(games: Game[]) {
  return games.map((game) => {
    const script = game.script;
    if (script?.id !== SUSHI_BUFFET_SCRIPT_ID) {
      return game;
    }

    const enabledRoleIds = new Set(game.sushiRoleIds ?? script.roles.map((role) => role.id));
    const enabledRoles = script.roles.filter((role) => enabledRoleIds.has(role.id));
    const disabledRoles = script.roles.filter((role) => !enabledRoleIds.has(role.id));
    const roles = enabledRoles.length <= disabledRoles.length ? enabledRoles : disabledRoles;

    return {
      ...game,
      script: { ...script, roles },
    };
  });
}

export function restoreSushiBuffetScriptRoles(games: Game[], roleCatalog: Role[]) {
  return games.map((game) => {
    const script = game.script;
    if (script?.id !== SUSHI_BUFFET_SCRIPT_ID) {
      return game;
    }

    const rolesById = new Map([...roleCatalog, ...script.roles].map((role) => [role.id, role]));

    return {
      ...game,
      script: {
        ...script,
        roles: mergeRoleCatalogMetadata([...rolesById.values()], roleCatalog),
      },
    };
  });
}

export function stripDuplicateScriptImages(games: Game[], scripts: StoredScript[]) {
  const scriptIds = new Set(scripts.map((script) => script.id));

  return games.map((game) => {
    if (!game.script || !scriptIds.has(game.script.id)) {
      return game;
    }

    return {
      ...game,
      script: {
        ...game.script,
        roles: game.script.roles.map(stripRoleImages),
      },
    };
  });
}

export function restoreDuplicateScriptImages(games: Game[], scripts: StoredScript[]) {
  const scriptsById = new Map(scripts.map((script) => [script.id, script]));

  return games.map((game) => {
    const script = game.script;
    const storedScript = script ? scriptsById.get(script.id) : undefined;

    if (!script || !storedScript) {
      return game;
    }

    const imagesByRoleId = new Map(
      storedScript.roles.map((role) => [role.id, getRoleImages(role)]),
    );

    return {
      ...game,
      script: {
        ...script,
        roles: script.roles.map((role) => {
          const images = imagesByRoleId.get(role.id);
          return images ? { ...role, ...images } : role;
        }),
      },
    };
  });
}

export function stripRedundantRoleImageUrl(role: Role): Role {
  if (role.imageUrls?.length === 1 && role.imageUrls[0] === role.imageUrl) {
    const { imageUrl: _imageUrl, ...roleWithoutImageUrl } = role;
    return roleWithoutImageUrl;
  }

  return role;
}

export function restoreRedundantRoleImageUrl(role: Role): Role {
  if (role.imageUrl === undefined && role.imageUrls?.length === 1) {
    return { ...role, imageUrl: role.imageUrls[0] };
  }

  return role;
}

function stripRoleImages(role: Role): Role {
  const { imageUrl, imageUrls, ...roleWithoutImages } = role;
  const remainingImageUrl = isDataImageUrl(imageUrl) ? undefined : imageUrl;
  const remainingImageUrls = imageUrls?.filter((image) => !isDataImageUrl(image));

  return {
    ...roleWithoutImages,
    ...(remainingImageUrl ? { imageUrl: remainingImageUrl } : {}),
    ...(remainingImageUrls?.length ? { imageUrls: remainingImageUrls } : {}),
  };
}

function getRoleImages(role: Role) {
  return {
    ...(role.imageUrl ? { imageUrl: role.imageUrl } : {}),
    ...(role.imageUrls?.length ? { imageUrls: role.imageUrls } : {}),
  };
}

function isDataImageUrl(value: string | undefined) {
  return value?.startsWith('data:image/') ?? false;
}
