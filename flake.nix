{
  description = "Uptime Monitor Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true; # Needed for terraform or other unfree tools if added
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            google-cloud-sdk
            git
            jdk21 # Java is required for Firebase Emulators (Requires 21+)
          ];

          shellHook = ''
            echo "🚀 Uptime Monitor Dev Shell"
            echo "node: $(node --version)"
            echo "gcloud: $(gcloud --version | head -n 1)"
            echo "firebase: $(firebase --version)"
          '';
        };
      }
    );
}
