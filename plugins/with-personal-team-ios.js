/**
 * Personal Team (Apple ID gratuito) não assina capabilities pagas.
 * O plugin do expo-notifications ainda entra via autolinking mesmo fora de `plugins`;
 * este mod remove as entitlements após os demais plugins.
 *
 * @param {import('expo/config').ExpoConfig} config
 */
function withPersonalTeamIos(config) {
  if (process.env.EXPO_IOS_PERSONAL_TEAM !== '1') {
    return config
  }

  const {
    withEntitlementsPlist,
    withInfoPlist,
  } = require('@expo/config-plugins')

  config = withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment']
    // Associated Domains exige Apple Developer Program pago.
    delete cfg.modResults['com.apple.developer.associated-domains']
    return cfg
  })

  config = withInfoPlist(config, (cfg) => {
    const modes = cfg.modResults.UIBackgroundModes
    if (Array.isArray(modes)) {
      cfg.modResults.UIBackgroundModes = modes.filter(
        (mode) => mode !== 'remote-notification',
      )
      if (cfg.modResults.UIBackgroundModes.length === 0) {
        delete cfg.modResults.UIBackgroundModes
      }
    }
    return cfg
  })

  return config
}

module.exports = withPersonalTeamIos
