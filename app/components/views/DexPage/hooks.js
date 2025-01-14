import { useSelector, useDispatch } from "react-redux";
import { useCallback, useMemo } from "react";
import { FormattedMessage as T } from "react-intl";
import * as sel from "selectors";
import * as da from "actions/DexActions";
import * as dm from "actions/DaemonActions";
import { RegisterPage, RegisterPageHeader } from "./RegisterPage";
import { DexView, DexViewHeader } from "./DexView";
import {
  CreateWalletsPage,
  CreateWalletsPageHeader
} from "./CreateWalletsPage";
import { EnablePage, EnablePageHeader } from "./EnablePage";
import { InitPage, InitPageHeader } from "./InitPage";
import { LoginPage, LoginPageHeader } from "./LoginPage";
import {
  CreateDexAcctPage,
  CreateDexAcctPageHeader
} from "./CreateDexAcctPage";
import ErrorHeader from "./ErrorHeader";
import { useIntl } from "react-intl";

export const useDex = () => {
  const dispatch = useDispatch();
  const dexEnabled = useSelector(sel.dexEnabled);
  const dexActive = useSelector(sel.dexActive);
  const dexInit = useSelector(sel.dexInit);
  const initDexAttempt = useSelector(sel.initDexAttempt);
  const registerDexAttempt = useSelector(sel.registerDexAttempt);
  const createWalletDexAttempt = useSelector(sel.createWalletDexAttempt);
  const loginDexAttempt = useSelector(sel.loginDexAttempt);
  const loggedIn = useSelector(sel.loggedInDex);
  const dexAddr = useSelector(sel.dexAddr);
  const dexConfig = useSelector(sel.dexConfig);
  const dexRegistered = useSelector(sel.dexRegistered);
  const dexConnected = useSelector(sel.dexConnected);
  const dexDCRWalletRunning = useSelector(sel.dexDCRWalletRunning);
  const dexBTCWalletRunning = useSelector(sel.dexBTCWalletRunning);
  const user = useSelector(sel.dexUser);
  const enableDexAttempt = useSelector(sel.enableDexAttempt);
  const dexAccount = useSelector(sel.dexAccount);
  const dexAccountAttempt = useSelector(sel.dexAccountAttempt);
  const dexSelectAccountAttempt = useSelector(sel.dexSelectAccountAttempt);
  const defaultServerAddress = useSelector(sel.defaultDEXServer);
  const dexGetFeeError = useSelector(sel.dexGetFeeError);
  const dexRegisterError = useSelector(sel.dexRegisterError);
  const dexLoginError = useSelector(sel.dexLoginError);
  const dexLogoutError = useSelector(sel.dexLogoutError);
  const dexCreateWalletError = useSelector(sel.dexRegisterError);
  const userError = useSelector(sel.userError);
  const initError = useSelector(sel.initError);
  const dexAccountError = useSelector(sel.dexAccountError);
  const dexEnableError = useSelector(sel.dexEnableError);
  const btcConfig = useSelector(sel.btcConfig);
  const btcInstallNeeded = useSelector(sel.btcInstallNeeded);
  const btcConfigUpdateNeeded = useSelector(sel.btcConfigUpdateNeeded);
  const btcWalletName = useSelector(sel.btcWalletName);
  const mixedAccount = useSelector(sel.getMixedAccount);
  const intl = useIntl();

  const onGetDexLogs = () => dispatch(dm.getDexLogs());
  const onLaunchDexWindow = useCallback(() => dispatch(da.launchDexWindow()), [
    dispatch
  ]);

  const onInitDex = useCallback(
    (passphrase) => dispatch(da.initDex(passphrase)),
    [dispatch]
  );

  const onRegisterDex = useCallback(
    (passphrase) => dispatch(da.registerDex(passphrase)),
    [dispatch]
  );

  const onCreateWalletDex = useCallback(
    (passphrase, appPassphrase, account) =>
      dispatch(da.createWalletDex(passphrase, appPassphrase, account)),
    [dispatch]
  );

  const onBTCCreateWalletDex = useCallback(
    (passphrase, appPassphrase, walletname) =>
      dispatch(da.btcCreateWalletDex(passphrase, appPassphrase, walletname)),
    [dispatch]
  );

  const onLoginDex = useCallback(
    (passphrase) => dispatch(da.loginDex(passphrase)),
    [dispatch]
  );

  const onCreateDexAccount = useCallback(
    (passphrase, name) => dispatch(da.createDexAccount(passphrase, name)),
    [dispatch]
  );
  const onSelectDexAccount = useCallback(
    (name) => dispatch(da.selectDexAccount(name)),
    [dispatch]
  );

  const onEnableDex = useCallback(() => dispatch(da.enableDex()), [dispatch]);

  const onGetConfig = useCallback(
    (address) => dispatch(da.getConfigDex(address)),
    [dispatch]
  );

  const onCheckBTCConfig = useCallback(() => dispatch(da.checkBTCConfig()), [
    dispatch
  ]);

  const onUpdateBTCConfig = useCallback(() => dispatch(da.updateBTCConfig()), [
    dispatch
  ]);

  const { Page, Header } = useMemo(() => {
    let page, header;
    if (!dexEnabled) {
      page = <EnablePage />;
      header = <EnablePageHeader />;
    } else if (dexActive) {
      if (dexInit) {
        if (!loggedIn) {
          page = <LoginPage />;
          header = <LoginPageHeader />;
        } else if (
          dexRegistered &&
          dexDCRWalletRunning &&
          dexBTCWalletRunning
        ) {
          page = <DexView />;
          header = <DexViewHeader />;
        } else if (!dexAccount) {
          page = <CreateDexAcctPage />;
          header = <CreateDexAcctPageHeader />;
        } else if (dexDCRWalletRunning && dexBTCWalletRunning) {
          page = <RegisterPage />;
          header = <RegisterPageHeader />;
        } else if (!dexDCRWalletRunning || !dexBTCWalletRunning) {
          page = <CreateWalletsPage />;
          header = <CreateWalletsPageHeader />;
        }
      } else {
        page = <InitPage />;
        header = <InitPageHeader />;
      }
    } else {
      page = (
        <div>
          <T
            id="dex.error.page"
            m="Critical Error! DEX is not running.  Please restart and check logs if problem persists."
          />
        </div>
      );
      header = <ErrorHeader />;
    }
    return { Page: page, Header: header };
  }, [
    dexEnabled,
    dexActive,
    dexInit,
    loggedIn,
    dexRegistered,
    dexDCRWalletRunning,
    dexBTCWalletRunning,
    dexAccount
  ]);

  return {
    dexEnabled,
    dexActive,
    dexInit,
    onInitDex,
    initDexAttempt,
    onRegisterDex,
    onGetDexLogs,
    registerDexAttempt,
    onCreateWalletDex,
    createWalletDexAttempt,
    onLoginDex,
    loginDexAttempt,
    loggedIn,
    dexAddr,
    dexConfig,
    dexRegistered,
    dexConnected,
    dexDCRWalletRunning,
    dexBTCWalletRunning,
    onEnableDex,
    enableDexAttempt,
    onGetConfig,
    user,
    onLaunchDexWindow,
    onBTCCreateWalletDex,
    onCreateDexAccount,
    onSelectDexAccount,
    dexAccount,
    dexAccountAttempt,
    dexSelectAccountAttempt,
    defaultServerAddress,
    dexGetFeeError,
    dexRegisterError,
    dexLoginError,
    dexLogoutError,
    dexCreateWalletError,
    userError,
    initError,
    dexAccountError,
    dexEnableError,
    btcConfig,
    onCheckBTCConfig,
    btcInstallNeeded,
    btcConfigUpdateNeeded,
    onUpdateBTCConfig,
    btcWalletName,
    Page,
    Header,
    mixedAccount,
    intl
  };
};
