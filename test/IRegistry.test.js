const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const crypto = require('crypto');

describe("IRegistry", async () => {

    const deployBIRegistry = async () => {
        const [admin, admin2, platformWallet, platformWallet2, user, user2, issuer] = await ethers.getSigners();
        const IRegistry = await ethers.getContractFactory("IRegistry");
        const iRegistry = await upgrades.deployProxy(IRegistry, [admin.address], { initializer: 'initialize' });
        return { iRegistry, admin, admin2, platformWallet, platformWallet2, user, user2, issuer }
    }

    describe("Role Management", async () => {
        describe("Add Admin", async () => {
            it("should add new admin", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                await expect(iRegistry.connect(admin).addAdmin(admin2))
                    .to.emit(iRegistry, 'AddAdmin')
                    .withArgs(admin2.address);
            });

            describe("should revert", async () => {
                it("if caller is not admin", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await expect(iRegistry.connect(admin2).addAdmin(user)).to.be.revertedWith("IRegistry: only admin")
                });

                it("if admin already added", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addAdmin(admin2)
                    await expect(iRegistry.connect(admin).addAdmin(admin2)).to.be.revertedWith("IRegistry: admin already added")
                });

            })
        })

        describe("Remove Admin", async () => {
            it("should remove admin", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addAdmin(admin2)
                await expect(iRegistry.connect(admin).removeAdmin(admin2))
                    .to.emit(iRegistry, 'RemoveAdmin')
                    .withArgs(admin2.address);
            });

            describe("should revert", async () => {
                it("if caller is not admin", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await expect(iRegistry.connect(admin2).removeAdmin(user)).to.be.revertedWith("IRegistry: only admin")
                });

                it("if admin not added", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await expect(iRegistry.connect(admin).removeAdmin(admin2)).to.be.revertedWith("IRegistry: admin not added")
                });

                it("if removing self", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await expect(iRegistry.connect(admin).removeAdmin(admin)).to.be.revertedWith("IRegistry: cannot remove self")
                });
            })
        })

        describe("Add Platform Wallet", async () => {
            it("should add new platform wallet", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                await expect(iRegistry.connect(admin).addPlatformWallet(platformWallet))
                    .to.emit(iRegistry, 'AddPlatformWallet')
                    .withArgs(platformWallet.address);
            });

            describe("should revert", async () => {
                it("if caller is not admin", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await expect(iRegistry.connect(admin2).addPlatformWallet(platformWallet)).to.be.revertedWith("IRegistry: only admin")
                });

                it("if platform wallet already added", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await expect(iRegistry.connect(admin).addPlatformWallet(platformWallet)).to.be.revertedWith("IRegistry: platform wallet already added")
                });
            })
        })

        describe("Remove Platform Wallet", async () => {
            it("should remove platform wallet", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                await expect(iRegistry.connect(admin).removePlatformWallet(platformWallet))
                    .to.emit(iRegistry, 'RemovePlatformWallet')
                    .withArgs(platformWallet.address);
            });

            describe("should revert", async () => {
                it("if caller is not admin", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await expect(iRegistry.connect(admin2).removePlatformWallet(platformWallet)).to.be.revertedWith("IRegistry: only admin")
                });

                it("if platform wallet not added", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await expect(iRegistry.connect(admin).removePlatformWallet(platformWallet)).to.be.revertedWith("IRegistry: platform wallet not added")
                });
            })
        })
    })

    describe("DID Management", async () => {
        const didStatus = { INACTIVE: 0, ACTIVE: 1, SUSPENDED: 2, TERMINATED: 3 }

        describe("Register DID", async () => {
            it("should register new DID", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, user2 } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                expect(await iRegistry.getDIDStatus(user)).to.equal(didStatus.INACTIVE)

                await expect(iRegistry.connect(platformWallet).registerDID(user))
                    .to.emit(iRegistry, 'RegisterDID')
                    .withArgs(user.address);

                expect(await iRegistry.getDIDStatus(user)).to.equal(didStatus.ACTIVE)
            });

            describe("should revert", async () => {
                it("if caller is not platform wallet", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await expect(iRegistry.connect(admin).registerDID(user)).to.be.revertedWith("IRegistry: only platform wallets")
                });

                it("if DID already active", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)
                    await expect(iRegistry.connect(platformWallet).registerDID(user)).to.be.revertedWith("IRegistry: DID already ACTIVE")
                });

            })
        })

        describe("Suspend DID", async () => {
            it("should suspend DID", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, user2 } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                await iRegistry.connect(platformWallet).registerDID(user)

                expect(await iRegistry.getDIDStatus(user)).to.equal(didStatus.ACTIVE)
                await expect(iRegistry.connect(admin).suspendDID(user))
                    .to.emit(iRegistry, 'SuspendDID')
                    .withArgs(user.address);

                expect(await iRegistry.getDIDStatus(user)).to.equal(didStatus.SUSPENDED)
            });

            describe("should revert", async () => {
                it("if caller is not admin", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)
                    await expect(iRegistry.connect(admin2).suspendDID(user)).to.be.revertedWith("IRegistry: only admin")
                });

                it("if DID not ACTIVE", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await expect(iRegistry.connect(admin).suspendDID(user)).to.be.revertedWith("IRegistry: DID not ACTIVE")
                });

            })
        })

        describe("UnSuspend DID", async () => {
            it("should unsuspend DID", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, user2 } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                await iRegistry.connect(platformWallet).registerDID(user)

                await iRegistry.connect(admin).suspendDID(user)
                expect(await iRegistry.getDIDStatus(user)).to.equal(didStatus.SUSPENDED)

                await expect(iRegistry.connect(admin).unSuspendDID(user))
                    .to.emit(iRegistry, 'UnSuspendDID')
                    .withArgs(user.address);
                expect(await iRegistry.getDIDStatus(user)).to.equal(didStatus.ACTIVE)
            });

            describe("should revert", async () => {
                it("if caller is not admin", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)
                    await iRegistry.connect(admin).suspendDID(user)
                    await expect(iRegistry.connect(admin2).unSuspendDID(user)).to.be.revertedWith("IRegistry: only admin")
                });

                it("if DID not SUSPENDED", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)
                    await expect(iRegistry.connect(admin).unSuspendDID(user)).to.be.revertedWith("IRegistry: DID not SUSPENDED")
                });

            })
        })

        describe("Terminate DID", async () => {
            it("should terminate DID", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, user2 } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                await iRegistry.connect(platformWallet).registerDID(user)
                expect(await iRegistry.getDIDStatus(user)).to.equal(didStatus.ACTIVE)

                await expect(iRegistry.connect(admin).terminateDID(user))
                    .to.emit(iRegistry, 'TerminateDID')
                    .withArgs(user.address);
                expect(await iRegistry.getDIDStatus(user)).to.equal(didStatus.TERMINATED)
            });

            describe("should revert", async () => {
                it("if caller is not admin", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)
                    await expect(iRegistry.connect(admin2).terminateDID(user)).to.be.revertedWith("IRegistry: only admin")
                });

                it("if DID not ACTIVE (INACTIVE)", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await expect(iRegistry.connect(admin).terminateDID(user)).to.be.revertedWith("IRegistry: DID not ACTIVE")
                });

                it("if DID not ACTIVE (TERMINATED)", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)
                    await iRegistry.connect(admin).terminateDID(user)
                    await expect(iRegistry.connect(admin).terminateDID(user)).to.be.revertedWith("IRegistry: DID not ACTIVE")
                });

            })
        })

    })

    describe("VC Management", async () => {
        const vcStatus = { INACTIVE: "0", ACTIVE: "1", EXPIRED: "2", SUSPENDED: "3", TERMINATED: "4" }

        describe("Issue VC", async () => {
            it("should issue new VC", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, user2, issuer } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                await iRegistry.connect(platformWallet).registerDID(user);

                const VCData = { name: "John Doe", dob: "01/10/2000" }
                const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                const vcString = JSON.stringify(VC);
                const sha512Hash = crypto.createHash('sha512');
                sha512Hash.update(vcString);
                const vcHash = `0x${sha512Hash.digest('hex')}`

                let { usageCount: usageCountBefore, status: statusBefore } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountBefore.toString(), statusBefore.toString()).to.equal('0', vcStatus.INACTIVE)

                await expect(iRegistry.connect(platformWallet).issueVC(vcHash))
                    .to.emit(iRegistry, 'IssueVC')
                    .withArgs(vcHash);

                let { usageCount: usageCountAfter, status: statusAfter } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountAfter.toString(), statusAfter.toString()).to.equal('0', vcStatus.ACTIVE)
            });

            describe("should revert", async () => {
                it("if caller is not platform wallet", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user);

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await expect(iRegistry.connect(admin).issueVC(vcHash)).to.be.revertedWith("IRegistry: only platform wallets")
                });

                it("if VC already ACTIVE", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await iRegistry.connect(platformWallet).issueVC(vcHash)
                    await expect(iRegistry.connect(platformWallet).issueVC(vcHash)).to.be.revertedWith("IRegistry: VC already ACTIVE")
                });

            })
        })

        describe("Suspend VC", async () => {
            it("should suspend a VC", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, user2, issuer } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                await iRegistry.connect(platformWallet).registerDID(user);

                const VCData = { name: "John Doe", dob: "01/10/2000" }
                const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                const vcString = JSON.stringify(VC);
                const sha512Hash = crypto.createHash('sha512');
                sha512Hash.update(vcString);
                const vcHash = `0x${sha512Hash.digest('hex')}`

                await iRegistry.connect(platformWallet).issueVC(vcHash)

                let { usageCount: usageCountBefore, status: statusBefore } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountBefore.toString(), statusBefore.toString()).to.equal('0', vcStatus.ACTIVE)

                await expect(iRegistry.connect(admin).suspendVC(vcHash))
                    .to.emit(iRegistry, 'SuspendVC')
                    .withArgs(vcHash);

                let { usageCount: usageCountAfter, status: statusAfter } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountAfter.toString(), statusAfter.toString()).to.equal('0', vcStatus.SUSPENDED)
            });

            describe("should revert", async () => {
                it("if caller is not admin", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user);

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await iRegistry.connect(platformWallet).issueVC(vcHash)
                    await expect(iRegistry.connect(platformWallet).suspendVC(vcHash)).to.be.revertedWith("IRegistry: only admin")
                });

                it("if VC not ACTIVE", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await expect(iRegistry.connect(admin).suspendVC(vcHash)).to.be.revertedWith("IRegistry: VC not ACTIVE")
                });

            })
        })

        describe("UnSuspend VC", async () => {
            it("should unsuspend a VC", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, user2, issuer } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                await iRegistry.connect(platformWallet).registerDID(user);

                const VCData = { name: "John Doe", dob: "01/10/2000" }
                const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                const vcString = JSON.stringify(VC);
                const sha512Hash = crypto.createHash('sha512');
                sha512Hash.update(vcString);
                const vcHash = `0x${sha512Hash.digest('hex')}`

                await iRegistry.connect(platformWallet).issueVC(vcHash)
                await iRegistry.connect(admin).suspendVC(vcHash)

                let { usageCount: usageCountBefore, status: statusBefore } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountBefore.toString(), statusBefore.toString()).to.equal('0', vcStatus.SUSPENDED)

                await expect(iRegistry.connect(admin).unSuspendVC(vcHash))
                    .to.emit(iRegistry, 'UnSuspendVC')
                    .withArgs(vcHash);

                let { usageCount: usageCountAfter, status: statusAfter } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountAfter.toString(), statusAfter.toString()).to.equal('0', vcStatus.ACTIVE)
            });

            describe("should revert", async () => {
                it("if caller is not admin", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user);

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await iRegistry.connect(platformWallet).issueVC(vcHash)
                    await iRegistry.connect(admin).suspendVC(vcHash)
                    await expect(iRegistry.connect(platformWallet).unSuspendVC(vcHash)).to.be.revertedWith("IRegistry: only admin")
                });

                it("if VC not SUSPENDED", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await iRegistry.connect(platformWallet).issueVC(vcHash)
                    await expect(iRegistry.connect(admin).unSuspendVC(vcHash)).to.be.revertedWith("IRegistry: VC not SUSPENDED")
                });

            })
        })

        describe("Terminate VC", async () => {
            it("should terminate a VC", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, user2, issuer } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                await iRegistry.connect(platformWallet).registerDID(user);

                const VCData = { name: "John Doe", dob: "01/10/2000" }
                const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                const vcString = JSON.stringify(VC);
                const sha512Hash = crypto.createHash('sha512');
                sha512Hash.update(vcString);
                const vcHash = `0x${sha512Hash.digest('hex')}`

                await iRegistry.connect(platformWallet).issueVC(vcHash)
                let { usageCount: usageCountBefore, status: statusBefore } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountBefore.toString(), statusBefore.toString()).to.equal('0', vcStatus.ACTIVE)

                await expect(iRegistry.connect(admin).terminateVC(vcHash))
                    .to.emit(iRegistry, 'TerminateVC')
                    .withArgs(vcHash);

                let { usageCount: usageCountAfter, status: statusAfter } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountAfter.toString(), statusAfter.toString()).to.equal('0', vcStatus.TERMINATED)
            });

            describe("should revert", async () => {
                it("if caller is not admin", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user);

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await iRegistry.connect(platformWallet).issueVC(vcHash)
                    await expect(iRegistry.connect(platformWallet).terminateVC(vcHash)).to.be.revertedWith("IRegistry: only admin")
                });

                it("if VC not ACTIVE", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await iRegistry.connect(platformWallet).issueVC(vcHash)
                    await iRegistry.connect(admin).terminateVC(vcHash)
                    await expect(iRegistry.connect(admin).terminateVC(vcHash)).to.be.revertedWith("IRegistry: VC not ACTIVE")
                });

            })
        })

        describe("Expire VC", async () => {
            it("should expire a VC", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, user2, issuer } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                await iRegistry.connect(platformWallet).registerDID(user);

                const VCData = { name: "John Doe", dob: "01/10/2000" }
                const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                const vcString = JSON.stringify(VC);
                const sha512Hash = crypto.createHash('sha512');
                sha512Hash.update(vcString);
                const vcHash = `0x${sha512Hash.digest('hex')}`

                await iRegistry.connect(platformWallet).issueVC(vcHash)
                let { usageCount: usageCountBefore, status: statusBefore } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountBefore.toString(), statusBefore.toString()).to.equal('0', vcStatus.ACTIVE)

                await expect(iRegistry.connect(platformWallet).expireVC(vcHash))
                    .to.emit(iRegistry, 'ExpireVC')
                    .withArgs(vcHash);

                let { usageCount: usageCountAfter, status: statusAfter } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountAfter.toString(), statusAfter.toString()).to.equal('0', vcStatus.EXPIRED)
            });

            describe("should revert", async () => {
                it("if caller is not a platform wallet", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user);

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await iRegistry.connect(platformWallet).issueVC(vcHash)
                    await expect(iRegistry.connect(admin).expireVC(vcHash)).to.be.revertedWith("IRegistry: only platform wallets")
                });

                it("if VC not ACTIVE", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await iRegistry.connect(platformWallet).issueVC(vcHash)
                    await iRegistry.connect(admin).terminateVC(vcHash)
                    await expect(iRegistry.connect(platformWallet).expireVC(vcHash)).to.be.revertedWith("IRegistry: VC not ACTIVE")
                });

            })
        })

        describe("Update Usage VC", async () => {
            it("should update usage of a VC", async () => {
                const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, user2, issuer } = await loadFixture(deployBIRegistry)
                await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                await iRegistry.connect(platformWallet).registerDID(user);

                const VCData = { name: "John Doe", dob: "01/10/2000" }
                const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                const vcString = JSON.stringify(VC);
                const sha512Hash = crypto.createHash('sha512');
                sha512Hash.update(vcString);
                const vcHash = `0x${sha512Hash.digest('hex')}`

                await iRegistry.connect(platformWallet).issueVC(vcHash)
                let { usageCount: usageCountBefore, status: statusBefore } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountBefore.toString(), statusBefore.toString()).to.equal('0', vcStatus.ACTIVE)

                await expect(iRegistry.connect(platformWallet).updateUsageVC(vcHash))
                    .to.emit(iRegistry, 'UpdateUsageVC')
                    .withArgs(vcHash, "1");

                let { usageCount: usageCountAfter, status: statusAfter } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountAfter.toString(), statusAfter.toString()).to.equal('1', vcStatus.ACTIVE)

                await expect(iRegistry.connect(platformWallet).updateUsageVC(vcHash))
                    .to.emit(iRegistry, 'UpdateUsageVC')
                    .withArgs(vcHash, "2");

                let { usageCount: usageCountAfter2, status: statusAfter2 } = await iRegistry.getVCStatus(vcHash);
                expect(usageCountAfter2.toString(), statusAfter2.toString()).to.equal('2', vcStatus.ACTIVE)
            });

            describe("should revert", async () => {
                it("if caller is not a platform wallet", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user);

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await iRegistry.connect(platformWallet).issueVC(vcHash)
                    await expect(iRegistry.connect(admin).updateUsageVC(vcHash)).to.be.revertedWith("IRegistry: only platform wallets")
                });

                it("if VC not ACTIVE", async () => {
                    const { iRegistry, admin, admin2, platformWallet, platformWallet2, user, issuer } = await loadFixture(deployBIRegistry)
                    await iRegistry.connect(admin).addPlatformWallet(platformWallet)
                    await iRegistry.connect(platformWallet).registerDID(user)

                    const VCData = { name: "John Doe", dob: "01/10/2000" }
                    const VC = { owner: user.address, issuer: issuer.address, data: VCData, signature: await issuer.signMessage(JSON.stringify(VCData)) }
                    const vcString = JSON.stringify(VC);
                    const sha512Hash = crypto.createHash('sha512');
                    sha512Hash.update(vcString);
                    const vcHash = `0x${sha512Hash.digest('hex')}`

                    await iRegistry.connect(platformWallet).issueVC(vcHash)
                    await iRegistry.connect(admin).terminateVC(vcHash)
                    await expect(iRegistry.connect(platformWallet).updateUsageVC(vcHash)).to.be.revertedWith("IRegistry: VC not ACTIVE")
                });

            })
        })
    })
});
