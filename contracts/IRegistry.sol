// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @author  Beno Sam Binu
 * @title   Identity Registry DiD / VC Management contract.
 * @dev     This contract is used for tracking DiD's and VC's in Identity Registry Platform.
 */

contract IRegistry is Initializable {
    /** Mappings */

    mapping(address => bool) private admins; // Platform admin wallets
    mapping(address => bool) private platformWallets; // Platform system wallets configured in backend used in automated flows

    enum didStatus {
        INACTIVE,
        ACTIVE,
        SUSPENDED,
        TERMINATED
    }
    mapping(address => didStatus) private dids; // Mapping from DID -> DIDStatus

    enum vcStatus {
        INACTIVE,
        ACTIVE,
        EXPIRED,
        SUSPENDED,
        TERMINATED
    }

    struct VC {
        uint256 usageCount;
        vcStatus status;
    }
    mapping(bytes => VC) private vcs; // Mapping from VC HASH -> VC Info {usageCount, status}

    /** Events */

    /**
     * @dev Event emitted when a new admin is added.
     * @param admin Address of the new admin.
     */
    event AddAdmin(address admin);

    /**
     * @dev Event emitted when an admin is removed.
     * @param admin Address of the admin.
     */
    event RemoveAdmin(address admin);

    /**
     * @dev Event emitted when new platform wallet is added.
     * @param platformWallet Address of the platform wallet.
     */
    event AddPlatformWallet(address platformWallet);

    /**
     * @dev Event emitted when a platform wallet is removed.
     * @param platformWallet Address of the platform wallet.
     */
    event RemovePlatformWallet(address platformWallet);

    /**
     * @dev Event emitted when a new DiD is registered in BI.
     * @param did Address of DiD.
     */
    event RegisterDID(address did);

    /**
     * @dev Event emitted when a DiD is suspended in BI.
     * @param did Address of DiD.
     */
    event SuspendDID(address did);

    /**
     * @dev Event emitted when a DiD is unsuspended in BI.
     * @param did Address of DiD.
     */
    event UnSuspendDID(address did);

    /**
     * @dev Event emitted when a DiD is terminated in BI.
     * @param did Address of DiD.
     */
    event TerminateDID(address did);

    /**
     * @dev Event emitted when a VC is issued in BI.
     * @param vcHash Hash of VC.
     */
    event IssueVC(bytes vcHash);

    /**
     * @dev Event emitted when a VC is suspended in BI.
     * @param vcHash Hash of VC.
     */
    event SuspendVC(bytes vcHash);

    /**
     * @dev Event emitted when a VC is unsuspended in BI.
     * @param vcHash Hash of VC.
     */
    event UnSuspendVC(bytes vcHash);

    /**
     * @dev Event emitted when a VC is terminated in BI.
     * @param vcHash Hash of VC.
     */
    event TerminateVC(bytes vcHash);

    /**
     * @dev Event emitted when a VC is expired in BI.
     * @param vcHash Hash of VC.
     */
    event ExpireVC(bytes vcHash);

    /**
     * @dev Event emitted when a VC is issued in BI.
     * @param vcHash Hash of VC.
     * @param totalUsage Total usage count of VC.
     */
    event UpdateUsageVC(bytes vcHash, uint totalUsage);

    /** Modifiers */

    /**
     * @dev modifier to check if caller address is an admin.
     */
    modifier onlyAdmin() {
        require(admins[msg.sender], "IRegistry: only admin");
        _;
    }

    /**
     * @dev modifier to check if caller address is an admin.
     */
    modifier onlyPlatformWallet() {
        require(
            platformWallets[msg.sender],
            "IRegistry: only platform wallets"
        );
        _;
    }

    /** Constructor */

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract with the initial admin.
     * @param _admin Address of the admin.
     */
    function initialize(address _admin) external initializer {
        admins[_admin] = true;
        emit AddAdmin(_admin);
    }

    /** Functions */

    /** Role Management */

    /**
     * @dev Add a new admin.
     * @param _admin Address of new admin.
     */
    function addAdmin(address _admin) external onlyAdmin {
        require(!admins[_admin], "IRegistry: admin already added");
        admins[_admin] = true;
        emit AddAdmin(_admin);
    }

    /**
     * @dev Remove an admin.
     * @param _admin Address of admin.
     */
    function removeAdmin(address _admin) external onlyAdmin {
        require(admins[_admin], "IRegistry: admin not added");
        require(msg.sender != _admin, "IRegistry: cannot remove self");
        delete admins[_admin];
        emit RemoveAdmin(_admin);
    }

    /**
     * @dev Add a new platform wallet.
     * @param _platformWallet Address of new platform wallet.
     */
    function addPlatformWallet(address _platformWallet) external onlyAdmin {
        require(
            !platformWallets[_platformWallet],
            "IRegistry: platform wallet already added"
        );
        platformWallets[_platformWallet] = true;
        emit AddPlatformWallet(_platformWallet);
    }

    /**
     * @dev Remove a platform wallet.
     * @param _platformWallet Address of platform wallet.
     */
    function removePlatformWallet(address _platformWallet) external onlyAdmin {
        require(
            platformWallets[_platformWallet],
            "IRegistry: platform wallet not added"
        );
        delete platformWallets[_platformWallet];
        emit RemovePlatformWallet(_platformWallet);
    }

    /** DID Management */

    /**
     * @dev Function to get status of a DID.
     * @param _did Address of the DID.
     */
    function getDIDStatus(address _did) external view returns (didStatus) {
        return dids[_did];
    }

    /**
     * @dev Register a new DID in the BI.
     * @param _did Address of the DID.
     */
    function registerDID(address _did) external onlyPlatformWallet {
        require(
            dids[_did] == didStatus.INACTIVE,
            "IRegistry: DID already ACTIVE"
        );

        dids[_did] = didStatus.ACTIVE;
        emit RegisterDID(_did);
    }

    /**
     * @dev Suspend a DID in the BI.
     * @param _did Address of the DID.
     */
    function suspendDID(address _did) external onlyAdmin {
        require(dids[_did] == didStatus.ACTIVE, "IRegistry: DID not ACTIVE");

        dids[_did] = didStatus.SUSPENDED;
        emit SuspendDID(_did);
    }

    /**
     * @dev Unsuspend a DID in the BI.
     * @param _did Address of the DID.
     */
    function unSuspendDID(address _did) external onlyAdmin {
        require(
            dids[_did] == didStatus.SUSPENDED,
            "IRegistry: DID not SUSPENDED"
        );

        dids[_did] = didStatus.ACTIVE;
        emit UnSuspendDID(_did);
    }

    /**
     * @dev Terminate a DID in the BI.
     * @param _did Address of the DID.
     */
    function terminateDID(address _did) external onlyAdmin {
        require(
            dids[_did] == didStatus.ACTIVE || dids[_did] == didStatus.SUSPENDED,
            "IRegistry: DID not ACTIVE"
        );

        dids[_did] = didStatus.TERMINATED;
        emit TerminateDID(_did);
    }

    /** VC Management */

    /**
     * @dev Function to get status of a VC.
     * @param _vcHash Hash of the VC.
     */
    function getVCStatus(
        bytes calldata _vcHash
    ) external view returns (VC memory) {
        return vcs[_vcHash];
    }

    /**
     * @dev Issue a new VC in the BI.
     * @param _vcHash Hash of the VC.
     */
    function issueVC(bytes calldata _vcHash) external onlyPlatformWallet {
        require(
            vcs[_vcHash].status == vcStatus.INACTIVE,
            "IRegistry: VC already ACTIVE"
        );

        vcs[_vcHash].status = vcStatus.ACTIVE;
        emit IssueVC(_vcHash);
    }

    /**
     * @dev Suspend a VC in the BI.
     * @param _vcHash Hash of the VC.
     */
    function suspendVC(bytes calldata _vcHash) external onlyAdmin {
        require(
            vcs[_vcHash].status == vcStatus.ACTIVE,
            "IRegistry: VC not ACTIVE"
        );

        vcs[_vcHash].status = vcStatus.SUSPENDED;
        emit SuspendVC(_vcHash);
    }

    /**
     * @dev Unsuspend a VC in the BI.
     * @param _vcHash Hash of the VC.
     */
    function unSuspendVC(bytes calldata _vcHash) external onlyAdmin {
        require(
            vcs[_vcHash].status == vcStatus.SUSPENDED,
            "IRegistry: VC not SUSPENDED"
        );

        vcs[_vcHash].status = vcStatus.ACTIVE;
        emit UnSuspendVC(_vcHash);
    }

    /**
     * @dev Terminate a VC in the BI.
     * @param _vcHash Hash of the VC.
     */
    function terminateVC(bytes calldata _vcHash) external onlyAdmin {
        require(
            vcs[_vcHash].status == vcStatus.ACTIVE ||
                vcs[_vcHash].status == vcStatus.SUSPENDED,
            "IRegistry: VC not ACTIVE"
        );

        vcs[_vcHash].status = vcStatus.TERMINATED;
        emit TerminateVC(_vcHash);
    }

    /**
     * @dev Expire a VC in the BI.
     * @param _vcHash Hash of the VC.
     */
    function expireVC(bytes calldata _vcHash) external onlyPlatformWallet {
        require(
            vcs[_vcHash].status == vcStatus.ACTIVE,
            "IRegistry: VC not ACTIVE"
        );

        vcs[_vcHash].status = vcStatus.EXPIRED;
        emit ExpireVC(_vcHash);
    }

    /**
     * @dev Update usage count for a VC in the BI.
     * @param _vcHash Hash of the VC.
     */
    function updateUsageVC(bytes calldata _vcHash) external onlyPlatformWallet {
        require(
            vcs[_vcHash].status == vcStatus.ACTIVE,
            "IRegistry: VC not ACTIVE"
        );

        vcs[_vcHash].usageCount++;
        emit UpdateUsageVC(_vcHash, vcs[_vcHash].usageCount);
    }
}
