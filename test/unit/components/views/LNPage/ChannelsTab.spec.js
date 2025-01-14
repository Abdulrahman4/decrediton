import { ChannelsTab } from "components/views/LNPage/ChannelsTab";
import { render } from "test-utils.js";
import user from "@testing-library/user-event";
import { screen, wait, fireEvent } from "@testing-library/react";
import * as sel from "selectors";
import * as lna from "actions/LNActions";
import * as wl from "wallet";
import { DCR } from "constants";
import {
  mockChannels,
  mockPendingChannels,
  mockClosedChannels,
  mockDescribeGraph
} from "./mocks";

const selectors = sel;
const lnActions = lna;
const wallet = wl;

let mockViewChannelDetails;
let mockOpenChannel;
let mockCloseChannel;
let mockModifyAutopilotStatus;

beforeEach(() => {
  selectors.currencyDisplay = jest.fn(() => DCR);
  selectors.lnPendingChannels = jest.fn(() => mockPendingChannels);
  selectors.lnClosedChannels = jest.fn(() => mockClosedChannels);
  selectors.lnChannels = jest.fn(() => mockChannels);
  mockViewChannelDetails = lnActions.viewChannelDetails = jest.fn(
    () => () => {}
  );
  mockOpenChannel = lnActions.openChannel = jest.fn(() => (dispatch) => {
    dispatch({
      type: lna.LNWALLET_RECENTLY_OPENEDCHANNEL,
      channelPoint: mockChannels[0].channelPoint
    });
    return Promise.resolve();
  });
  mockCloseChannel = lnActions.closeChannel = jest.fn(() => () => {});
  selectors.lnDescribeGraph = jest.fn(() => mockDescribeGraph);
  mockModifyAutopilotStatus = lnActions.modifyAutopilotStatus = jest.fn(
    () => () => {}
  );
});

test("test channel list", () => {
  render(<ChannelsTab />);

  // check active card
  user.click(screen.getByText(mockChannels[0].channelPoint));
  expect(mockViewChannelDetails).toHaveBeenCalledWith(
    mockChannels[0].channelPoint
  );
  expect(screen.getByText("Open").previousSibling.alt).toBe("greenCheck");
  expect(
    screen.getByText("Open").parentNode.parentNode.parentNode.textContent
  ).toBe("2.00000 DCRcpa-0Open Local:0.7899636 DCR Remote:1.21000 DCRCapacity");

  // check pending card
  user.click(screen.getByText(mockPendingChannels[0].channelPoint));
  expect(mockViewChannelDetails).toHaveBeenCalledWith(
    mockPendingChannels[0].channelPoint
  );
  expect(screen.getByText("Pending").previousSibling.alt).toBe("bluePending");
  expect(
    screen.getByText("Pending").parentNode.parentNode.parentNode.textContent
  ).toBe(
    "2.00000 DCRcpp-0Pending Local:0.9999636 DCR Remote:1.00000 DCRCapacity"
  );

  // check closed card
  user.click(screen.getByText(mockClosedChannels[0].channelPoint));
  expect(mockViewChannelDetails).toHaveBeenCalledWith(
    mockClosedChannels[0].channelPoint
  );
  expect(screen.getByText("Closed").previousSibling.alt).toBe("grayNegative");
  expect(screen.getByText("Settled:").parentElement.textContent).toBe(
    "Settled:0.47381162 DCR"
  );
  expect(screen.getByText("Timelocked:").parentElement.textContent).toBe(
    "Timelocked:0.00000 DCR"
  );
});

test("test filter control", async () => {
  render(<ChannelsTab />);

  // by default, all types are shown
  expect(screen.getByText("Open")).toBeInTheDocument();
  expect(screen.getByText("Pending")).toBeInTheDocument();
  expect(screen.getByText("Closed")).toBeInTheDocument();

  const filterMenuButton = screen.getByRole("button", {
    name: "EyeFilterMenu"
  });

  user.click(filterMenuButton);
  user.click(screen.getAllByText("Closed")[0]);

  await wait(() => expect(screen.queryByText("Open")).not.toBeInTheDocument());
  expect(screen.queryByText("Pending")).not.toBeInTheDocument();
  expect(screen.getByText("Closed")).toBeInTheDocument();

  user.click(filterMenuButton);
  user.click(screen.getAllByText("Pending")[0]);

  await wait(() =>
    expect(screen.queryByText("Closed")).not.toBeInTheDocument()
  );
  expect(screen.queryByText("Open")).not.toBeInTheDocument();
  expect(screen.getByText("Pending")).toBeInTheDocument();
});

test("test search control", async () => {
  render(<ChannelsTab />);

  // by default, all types are shown
  expect(screen.getByText("Open")).toBeInTheDocument();
  expect(screen.getByText("Pending")).toBeInTheDocument();
  expect(screen.getByText("Closed")).toBeInTheDocument();

  const searchInput = screen.getByPlaceholderText("Filter by Channel Point");
  fireEvent.change(searchInput, {
    target: { value: "not valid channel point" }
  });

  await wait(() => expect(screen.queryByText("Open")).not.toBeInTheDocument());
  expect(screen.queryByText("Pending")).not.toBeInTheDocument();
  expect(screen.queryByText("Closed")).not.toBeInTheDocument();
  expect(screen.getByText(/no channel found/i)).toBeInTheDocument();

  fireEvent.change(searchInput, {
    target: { value: "cpp" }
  });
  await wait(() => expect(screen.getByText("Pending")).toBeInTheDocument());
  fireEvent.change(searchInput, {
    target: { value: "" }
  });
  await wait(() => expect(screen.getByText("Open")).toBeInTheDocument());
  expect(screen.getByText("Pending")).toBeInTheDocument();
  expect(screen.getByText("Closed")).toBeInTheDocument();
});

const getNodeInput = () => screen.getByLabelText("Counterparty Node");
const getAmountToCommitInput = () => screen.getByLabelText("Amount to Commit");
const getPushAmountToCommitInput = () =>
  screen.getByLabelText("Push Amount (optional)");
const getCreateChannelButton = () =>
  screen.getByRole("button", { name: "Create Channel" });
const getCancelChannelButton = () =>
  screen.getByRole("button", { name: "Close Channel" });
const getConfirmButton = () => screen.getByText("Confirm");
const getPasteButton = () => screen.getByRole("button", { name: "Paste" });
const getClearButton = () =>
  screen.getByRole("button", { name: "Clear Address" });
const getSearchButton = () => screen.getByTestId("searchForNodesButton");
const getSearchForNodeModalTitle = () => screen.getByText("Search For Nodes");
const querySearchForNodeModalTitle = () =>
  screen.queryByText("Search For Nodes");
const getSearchResultsTitle = () => screen.getByText(/search results \(/i);
const getSearchInput = () =>
  screen.getByLabelText("Search the Network or Paste Public Key");
const getSearchPasteBt = () => screen.getByText("Paste NodePubKey@ip:port");
const getSearchClearBt = () =>
  screen.getByRole("button", { name: "Clear NodePubKey" });
const getAuotPilotToggleSwitch = () => screen.getByTestId("toggleSwitch");

test("test create form and receintly created modal", async () => {
  render(<ChannelsTab />);

  const mockNode = "mock-node";
  const mockAmount = 12;
  const createChannelBt = getCreateChannelButton();

  expect(createChannelBt.disabled).toBe(true);
  user.type(getNodeInput(), mockNode);
  expect(createChannelBt.disabled).toBe(true);
  user.type(getAmountToCommitInput(), `${mockAmount}`);
  expect(createChannelBt.disabled).toBe(false);

  user.click(createChannelBt);
  await wait(() =>
    expect(mockOpenChannel).toHaveBeenCalledWith(
      mockNode,
      mockAmount * 100000000,
      null //pushAmt is null on mainnet
    )
  );

  // inputs shoud be reseted now
  expect(getNodeInput().value).toBe("");
  expect(getAmountToCommitInput().value).toBe("");

  await wait(() => screen.getByText("Channel Created"));

  expect(
    screen.getAllByText("Open")[1].parentNode.parentNode.parentNode.textContent
  ).toBe("2.00000 DCRcpa-0Open Local:0.7899636 DCR Remote:1.21000 DCRCapacity");

  expect(screen.getByText("Channel ID:").nextSibling.textContent).toBe(
    mockChannels[0].chanId
  );
  expect(screen.getByText("Channel Point:").nextSibling.textContent).toBe(
    mockChannels[0].channelPoint
  );
  expect(screen.getByText("Commit Fee:").nextSibling.textContent).toBe(
    "0.0000364 DCR"
  );
  expect(screen.getByText("CSV Delay:").nextSibling.textContent).toBe(
    `${mockChannels[0].csvDelay} Blocks`
  );

  const cancelChannelBt = getCancelChannelButton();
  user.click(cancelChannelBt);
  expect(
    screen.getByText(/Attempt cooperative close of channel/i)
  ).toBeInTheDocument();

  fireEvent.click(getConfirmButton());

  await wait(() =>
    expect(mockCloseChannel).toHaveBeenCalledWith(
      mockChannels[0].channelPoint,
      false
    )
  );
  expect(
    screen.queryByText(/Attempt cooperative close of channel/i)
  ).not.toBeInTheDocument();

  //close recentlyOpenedChannel modal
  user.click(screen.getByTestId("lnchannel-close-button"));
  expect(screen.queryByText("Channel Created")).not.toBeInTheDocument();
});

test("test push amount in testnet mode", async () => {
  selectors.isTestNet = jest.fn(() => true);
  selectors.isMainNet = jest.fn(() => false);
  render(<ChannelsTab />);

  const mockNode = "mock-node";
  const mockAmount = 12;
  const mockPushAmount = 34;
  const createChannelBt = getCreateChannelButton();

  expect(createChannelBt.disabled).toBe(true);
  user.type(getNodeInput(), mockNode);
  expect(createChannelBt.disabled).toBe(true);
  user.type(getAmountToCommitInput(), `${mockAmount}`);
  expect(createChannelBt.disabled).toBe(false);
  user.type(getPushAmountToCommitInput(), `${mockPushAmount}`);
  expect(createChannelBt.disabled).toBe(false);

  user.click(createChannelBt);
  await wait(() =>
    expect(mockOpenChannel).toHaveBeenCalledWith(
      mockNode,
      mockAmount * 100000000,
      mockPushAmount * 100000000
    )
  );

  // inputs shoud be reseted now
  expect(getNodeInput().value).toBe("");
  expect(getAmountToCommitInput().value).toBe("");
  expect(getPushAmountToCommitInput().value).toBe("");

  await wait(() => screen.getByText("Channel Created"));
});

test("test failing channel create form", async () => {
  mockOpenChannel = lnActions.openChannel = jest.fn(() => () => {
    return Promise.reject();
  });
  render(<ChannelsTab />);

  const mockNode = "mock-node";
  const mockAmount = 12;
  const createChannelBt = getCreateChannelButton();

  expect(createChannelBt.disabled).toBe(true);
  user.type(getNodeInput(), mockNode);
  expect(createChannelBt.disabled).toBe(true);
  user.type(getAmountToCommitInput(), `${mockAmount}`);
  expect(createChannelBt.disabled).toBe(false);

  user.click(createChannelBt);
  expect(createChannelBt.disabled).toBe(true);
  expect(mockOpenChannel).toHaveBeenCalled();

  await wait(() => expect(createChannelBt.disabled).toBe(false));

  // inputs shoud NOT be reseted
  expect(getNodeInput().value).toBe(mockNode);
  expect(getAmountToCommitInput().value).toBe(`${mockAmount}`);

  expect(screen.queryByText("Channel Created")).not.toBeInTheDocument();
});

test("test paste and clear button", async () => {
  render(<ChannelsTab />);

  const mockPastedNodePubKey = "mockPastedNodePubKey";
  wallet.readFromClipboard.mockImplementation(() => mockPastedNodePubKey);

  user.click(getPasteButton());
  await wait(() => expect(getNodeInput().value).toBe(mockPastedNodePubKey));

  user.click(getClearButton());
  await wait(() => expect(getNodeInput().value).toBe(""));
});

test("test recent node list", () => {
  render(<ChannelsTab />);

  expect(screen.getByText("Recent Nodes").nextSibling.textContent).toBe(
    "mock-alias-1mock-alias-0mock-alias-2"
  );
  user.click(screen.getByText("mock-alias-1"));
  expect(getNodeInput().value).toBe(mockPendingChannels[0].remotePubkey);
});

test("test empty recent node and channel list", () => {
  selectors.lnPendingChannels = jest.fn(() => []);
  selectors.lnClosedChannels = jest.fn(() => []);
  selectors.lnChannels = jest.fn(() => []);
  render(<ChannelsTab />);

  expect(screen.getByText("Recent Nodes").nextSibling.textContent).toBe(
    "No nodes yet"
  );

  expect(screen.getByText("No channel found")).toBeInTheDocument();
});

test("test search for node modal", async () => {
  render(<ChannelsTab />);

  user.click(getSearchButton());
  expect(getSearchForNodeModalTitle()).toBeInTheDocument();

  // simple close
  user.click(screen.getByTestId("closeSearchForNodesModalBt"));
  expect(querySearchForNodeModalTitle()).not.toBeInTheDocument();

  // reopen
  user.click(getSearchButton());

  // test recent nodes
  expect(screen.getAllByText("Recent Nodes")[1].nextSibling.textContent).toBe(
    "mock-alias-1mock...ub-0mock-alias-0mock...ey-0mock-alias-2mock...ey-0"
  );
  user.click(screen.getByText("mock...ub-0").parentElement.nextSibling);
  expect(querySearchForNodeModalTitle()).not.toBeInTheDocument();
  expect(getNodeInput().value).toBe(mockPendingChannels[0].remotePubkey);

  // reopen
  user.click(getSearchButton());

  // test paste button
  const mockPastedAlias = "channel";
  wallet.readFromClipboard.mockImplementation(() => mockPastedAlias);

  user.click(getSearchPasteBt());
  await wait(() => expect(getSearchInput().value).toBe(mockPastedAlias));
  expect(getSearchResultsTitle().parentElement.textContent).toBe(
    "Search Results (2)mock-alias-1mock...ub-0mock-alias-2mock...ey-0"
  );
  user.click(getSearchClearBt());
  await wait(() => expect(getSearchInput().value).toBe(""));

  // type alias
  user.type(getSearchInput(), "mock-alias-0"); // alias of the first open channel's node
  expect(getSearchResultsTitle().parentElement.textContent).toBe(
    "Search Results (1)mock-alias-0mock...ey-0"
  );

  user.type(getSearchInput(), "notvalidaliasorpubkey");
  expect(getSearchResultsTitle().parentElement.textContent).toBe(
    "Search Results (0)No matching nodes found"
  );
});

test("test automatic channel creation", () => {
  render(<ChannelsTab />);

  user.click(getAuotPilotToggleSwitch());
  expect(mockModifyAutopilotStatus).toHaveBeenCalledWith(true);
});

const testPubkey = (pubkey, isValid, nodeInput, createChannelBt, message) => {
  fireEvent.change(nodeInput, {
    target: {
      value: pubkey
    }
  });
  if (isValid) {
    expect(createChannelBt.disabled).toBe(false);
    expect(
      screen.getByText(message ? message : "Valid PubKey")
    ).toBeInTheDocument();
  } else {
    expect(createChannelBt.disabled).toBe(true);
    expect(
      screen.getByText(message ? message : "Invalid Node Id")
    ).toBeInTheDocument();
  }
};

test("test node validation", () => {
  render(<ChannelsTab />);

  const mockAmount = 12;
  const createChannelBt = getCreateChannelButton();
  const nodeInput = getNodeInput();
  const mockValidPubKey =
    "038fde001dbe4d6286ab168cfd1e9711ad0cbb8fc4e3c2312f2b42063b72af8e71";
  // last digit changed to invalid hex char `x`
  const mockInvalidPubKey =
    "038fde001dbe4d6286ab168cfd1e9711ad0cbb8fc4e3c2312f2b42063b72af8e7x";
  // last digit changed to invalid hex char `x`
  const mockInvalidHexPubKey =
    "038fde001dbe4d6286ab168cfd1e9711ad0cbb8fc4e3c2312f2b42063b72af8e71xxx";

  user.type(getAmountToCommitInput(), `${mockAmount}`);

  testPubkey(mockValidPubKey, true, nodeInput, createChannelBt);
  testPubkey(mockInvalidPubKey, false, nodeInput, createChannelBt);
  testPubkey(mockInvalidHexPubKey, false, nodeInput, createChannelBt);

  testPubkey(
    `${mockValidPubKey}@address@address`,
    false,
    nodeInput,
    createChannelBt,
    "More than one @ in the node address"
  );

  testPubkey(
    `${mockValidPubKey}@address:port:port`,
    false,
    nodeInput,
    createChannelBt,
    "More than one : in the node address"
  );

  // mock valid node with domain
  testPubkey(`${mockValidPubKey}@domain`, true, nodeInput, createChannelBt);

  // mock valid node with ip and port
  testPubkey(
    `${mockValidPubKey}@127.0.0.1:88`,
    true,
    nodeInput,
    createChannelBt
  );

  testPubkey(mockValidPubKey, true, nodeInput, createChannelBt);

  //
  // test public keys from
  // https://github.com/decred/dcrd/blob/master/dcrec/secp256k1/pubkey_test.go
  //

  // uncompressed ok
  testPubkey(
    "04" +
      "11db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5c" +
      "b2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3",
    true,
    nodeInput,
    createChannelBt
  );
  // uncompressed x changed (not on curve)
  testPubkey(
    "04" +
      "15db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5c" +
      "b2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3",
    false,
    nodeInput,
    createChannelBt
  );
  // uncompressed y changed (not on curve)
  testPubkey(
    "04" +
      "11db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5c" +
      "b2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a4",
    false,
    nodeInput,
    createChannelBt
  );
  // uncompressed claims compressed
  testPubkey(
    "03" +
      "11db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5c" +
      "b2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3",
    false,
    nodeInput,
    createChannelBt
  );
  // uncompressed as hybrid ok (ybit = 0)
  testPubkey(
    "06" +
      "11db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5c" +
      "4d1f1522047b33068bbb9b07d1e9f40564749b062b3fc0666479bc08a94be98c",
    true,
    nodeInput,
    createChannelBt
  );
  // uncompressed as hybrid ok (ybit = 1)
  testPubkey(
    "07" +
      "11db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5c" +
      "b2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3",
    true,
    nodeInput,
    createChannelBt
  );
  // uncompressed as hybrid wrong oddness
  testPubkey(
    "06" +
      "11db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5c" +
      "b2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3",
    false,
    nodeInput,
    createChannelBt
  );
  // compressed ok (ybit = 0)
  testPubkey(
    "02" + "ce0b14fb842b1ba549fdd675c98075f12e9c510f8ef52bd021a9a1f4809d3b4d",
    true,
    nodeInput,
    createChannelBt
  );
  // compressed ok (ybit = 1)
  testPubkey(
    "03" + "2689c7c2dab13309fb143e0e8fe396342521887e976690b6b47f5b2a4b7d448e",
    true,
    nodeInput,
    createChannelBt
  );
  // compressed claims uncompressed (ybit = 0)
  testPubkey(
    "04" + "ce0b14fb842b1ba549fdd675c98075f12e9c510f8ef52bd021a9a1f4809d3b4d",
    false,
    nodeInput,
    createChannelBt
  );
  // compressed claims uncompressed (ybit = 1)
  testPubkey(
    "04" + "2689c7c2dab13309fb143e0e8fe396342521887e976690b6b47f5b2a4b7d448e",
    false,
    nodeInput,
    createChannelBt
  );
  // compressed claims hybrid (ybit = 0)
  testPubkey(
    "06" + "ce0b14fb842b1ba549fdd675c98075f12e9c510f8ef52bd021a9a1f4809d3b4d",
    false,
    nodeInput,
    createChannelBt
  );
  // compressed claims hybrid (ybit = 1)
  testPubkey(
    "07" + "2689c7c2dab13309fb143e0e8fe396342521887e976690b6b47f5b2a4b7d448e",
    false,
    nodeInput,
    createChannelBt
  );
  // compressed with invalid x coord (ybit = 0)
  testPubkey(
    "03" + "ce0b14fb842b1ba549fdd675c98075f12e9c510f8ef52bd021a9a1f4809d3b4c",
    false,
    nodeInput,
    createChannelBt
  );
  // compressed with invalid x coord (ybit = 1)
  testPubkey(
    "03" + "2689c7c2dab13309fb143e0e8fe396342521887e976690b6b47f5b2a4b7d448d",
    false,
    nodeInput,
    createChannelBt
  );
  // wrong length
  testPubkey("05", false, nodeInput, createChannelBt);
  // uncompressed x == p
  testPubkey(
    "04" +
      "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f" +
      "b2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3",
    false,
    nodeInput,
    createChannelBt
  );
  // uncompressed x > p (p + 1 -- aka 1)
  testPubkey(
    "04" +
      "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc30" +
      "bde70df51939b94c9c24979fa7dd04ebd9b3572da7802290438af2a681895441",
    false,
    nodeInput,
    createChannelBt
  );
  // uncompressed y == p
  testPubkey(
    "04" +
      "11db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5c" +
      "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
    false,
    nodeInput,
    createChannelBt
  );
  // uncompressed y > p (p + 1 -- aka 1)
  testPubkey(
    "04" +
      "1fe1e5ef3fceb5c135ab7741333ce5a6e80d68167653f6b2b24bcbcfaaaff507" +
      "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc30",
    false,
    nodeInput,
    createChannelBt
  );
  // compressed x == p (ybit = 0)
  testPubkey(
    "02" + "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
    false,
    nodeInput,
    createChannelBt
  );
  // compressed x == p (ybit = 1)
  testPubkey(
    "03" + "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
    false,
    nodeInput,
    createChannelBt
  );
  // compressed x > p (p + 2 -- aka 2) (ybit = 0)
  testPubkey(
    "02" + "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc31",
    false,
    nodeInput,
    createChannelBt
  );
  // compressed x > p (p + 1 -- aka 1) (ybit = 1)
  testPubkey(
    "03" + "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc30",
    false,
    nodeInput,
    createChannelBt
  );
  // hybrid x == p (ybit = 1)
  testPubkey(
    "07" +
      "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f" +
      "b2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3",
    false,
    nodeInput,
    createChannelBt
  );
  // hybrid x > p (p + 1 -- aka 1) (ybit = 0)
  testPubkey(
    "06" +
      "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc30" +
      "bde70df51939b94c9c24979fa7dd04ebd9b3572da7802290438af2a681895441",
    false,
    nodeInput,
    createChannelBt
  );
  // hybrid y == p (ybit = 0 when mod p)
  testPubkey(
    "06" +
      "11db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5c" +
      "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
    false,
    nodeInput,
    createChannelBt
  );
  // hybrid y > p (p + 1 -- aka 1) (ybit = 1 when mod p)
  testPubkey(
    "07" +
      "1fe1e5ef3fceb5c135ab7741333ce5a6e80d68167653f6b2b24bcbcfaaaff507" +
      "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc30",
    false,
    nodeInput,
    createChannelBt
  );
});
