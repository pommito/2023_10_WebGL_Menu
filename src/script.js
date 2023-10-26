import * as THREE from 'three';
import images from './image.js'
import fragment from './shaders/fragment.glsl'
import vertex from './shaders/vertex.glsl'

function lerp(start, end, t)
{
    return start * ( 1 - t) + end * t;
}

// Mouse coordinate
let targetX = 0;
let targetY = 0;

// Load image textures for Mesh
const textureLoader = new THREE.TextureLoader()

const textureOne = textureLoader.load(images.imageOne)
const textureTwo = textureLoader.load(images.imageTwo)
const textureThree = textureLoader.load(images.imageThree)
const textureFour = textureLoader.load(images.imageFour)

class Sketch 
{
    constructor()
    {
        this.container = document.querySelector('main');
        this.links = [...document.querySelectorAll('li')];
        
        this.scene = new THREE.Scene();
        // Camera perspective on the z axis
        this.cameraPerspective = 1000;

        // Mesh sizes
        this.meshSizes = new THREE.Vector2(0,0);
        // Mesh position
        this.offset = new THREE.Vector2(0,0);

        this.uniforms = {
            uTexture : { value: textureOne},
            uAlpha : { value : 0},
            uOffset : { value: new THREE.Vector2(0,0)}
        }

// Setting the value of the Texture for each link

        this.links.forEach((link, idx) =>
        {
            link.addEventListener('mouseenter', () => {
                switch(idx)
                {
                    case 0:
                        this.uniforms.uTexture.value = textureOne;
                        break
                    case 1:
                        this.uniforms.uTexture.value = textureTwo;
                        break
                    case 2:
                        this.uniforms.uTexture.value = textureThree;
                        break
                    case 3:
                        this.uniforms.uTexture.value = textureFour;
                        break
                }
            })
        })

        this.addEventListeners(document.querySelector('ul'));
        this.setupCamera();
        this.onMousemove();
        this.createMesh();
        this.render();
    }

    get viewport(){
        let width = window.innerWidth;
        let height = window.innerHeight;
        let aspectRatio = width / height;

        return{
            width,
            height,
            aspectRatio
        }
    }
    

    addEventListeners(element)
    {
        element.addEventListener('mouseenter', () =>
        {
            this.linksHover = true;
        })
        element.addEventListener('mouseleave', () =>
        {
            this.linksHover = false;
        })
    }

    setupCamera()
    {
        //Listening resize events
        window.addEventListener('resize', this.onWindowResize.bind(this));

        let fov = (180 * (2 * Math.atan(this.viewport.height / 2 / this.cameraPerspective))) / Math.PI;
        this.camera = new THREE.PerspectiveCamera(fov, this.viewport.aspectRatio, 0.1, 1000);
        this.camera.position.set( 0, 0, this.cameraPerspective);

        // Renderer / canvas
        this.renderer = new THREE.WebGL1Renderer({antialias : true, alpha : true});
        this.renderer.setSize(this.viewport.width, this.viewport.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
    }

    // Handling resize events
    onWindowResize()
    {
        this.camera.aspect = this.viewport.aspectRatio;
        this.camera.fov = (180 * (2 * Math.atan(this.viewport.height / 2 / this.cameraPerspective))) / Math.PI;
        this.renderer.setSize(this.viewport.width, this.viewport.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.camera.updateProjectionMatrix();
    }

    // Updating the mouse coordinate
    onMousemove()
    {
        window.addEventListener('mousemove', (e) => 
        {
            targetX = e.clientX;
            targetY = e.clientY;
        })
    }

    createMesh()
    {
        this.geometry = new THREE.PlaneGeometry(1, 1, 20, 20);
        this.material = new THREE.ShaderMaterial(
            {
                uniforms : this.uniforms,
                vertexShader: vertex,
                fragmentShader: fragment,
                transparent: true
            });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.meshSizes.set(125, 175);
        this.mesh.scale.set(this.meshSizes.x, this.meshSizes.y);
        this.mesh.position.set(this.offset.x, this.offset.y, 0);

        this.scene.add(this.mesh);
    }

    render()
    {
        this.offset.x = lerp(this.offset.x, targetX, 0.1);
        this.offset.y = lerp(this.offset.y, targetY, 0.1);
        this.uniforms.uOffset.value.set((targetX - this.offset.x) * 0.0015, -(targetY - this.offset.y) * 0.0015);
        this.mesh.position.set(this.offset.x - (window.innerWidth / 2), -this.offset.y + (window.innerHeight / 2));

        this.linksHover
        ? this.uniforms.uAlpha.value = lerp(this.uniforms.uAlpha.value, 1.0, 0.1)
        : this.uniforms.uAlpha.value = lerp(this.uniforms.uAlpha.value, 0.0, 0.1)

        for(let i = 0; i < this.links.length; i++)
        {
            if(this.linksHover)
            {
                this.links[i].style.opacity = 0.75;
            } else 
            {
                this.links[i].style.opacity = 0.75;
            }
        }
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this))
    }
}

new Sketch()