import { wallet } from "wallet-preload-shim";
import { useNetwork } from "hooks";
import { Link, Button } from "pi-ui";

const clicker = (isTestNet, href, hrefTestNet) => () => {
  const url = hrefTestNet && isTestNet ? hrefTestNet : href;
  wallet.openExternalURL(url);
};

const ExternalButton = ({
  className,
  size,
  href,
  children,
  hrefTestNet,
  ButtonComponent
}) => {
  const { isTestNet } = useNetwork();
  return (
    <Link
      onClick={clicker(isTestNet, href, hrefTestNet)}
      className={className}
      size={size ? size : "md"}
      customComponent={(props) =>
        ButtonComponent ? (
          <ButtonComponent {...props}>{children}</ButtonComponent>
        ) : (
          <Button {...props}>{children}</Button>
        )
      }
    />
  );
};

export default ExternalButton;
